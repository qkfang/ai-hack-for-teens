import { transform } from "sucrase";

export interface CompileResult {
  success: boolean;
  code?: string;
  error?: string;
}

function stripImports(source: string): string {
  return source
    .replace(/^\s*import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^\s*import\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^\s*import\s*\{[\s\S]*?\}\s*from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n');
}

export function compileCode(source: string): CompileResult {
  try {
    const strippedSource = stripImports(source);
    const result = transform(strippedSource, {
      transforms: ["typescript", "jsx", "imports"],
      jsxRuntime: "classic",
      production: true,
    });
    return { success: true, code: result.code };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown compilation error" };
  }
}

export function compileToComponent(
  source: string,
  scope: Record<string, unknown>
): { success: boolean; Component?: React.ComponentType; error?: string } {
  const compiled = compileCode(source);
  if (!compiled.success || !compiled.code) return { success: false, error: compiled.error };

  try {
    const reservedNames = new Set(["React", "exports", "module"]);
    const scopeEntries = Object.entries(scope).filter(([key]) => !reservedNames.has(key));
    const scopeKeys = scopeEntries.map(([key]) => key);
    const scopeValues = scopeEntries.map(([, value]) => value);

    const wrappedCode = `
      ${compiled.code}
      return typeof exports !== 'undefined' && exports.default ? exports.default : 
             typeof module !== 'undefined' && module.exports ? module.exports : 
             null;
    `;

    const factory = new Function("React", "exports", "module", ...scopeKeys, wrappedCode);
    const exports: Record<string, unknown> = {};
    // eslint-disable-next-line @next/next/no-assign-module-variable
    const module = { exports };
    const Component = factory(scope.React, exports, module, ...scopeValues);

    if (!Component) return { success: false, error: "No default export found" };
    return { success: true, Component };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Runtime error" };
  }
}
