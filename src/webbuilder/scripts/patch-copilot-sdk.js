const fs = require('fs');
const path = require('path');

const sdkDir = path.join(__dirname, '..', 'node_modules', '@github', 'copilot-sdk', 'dist');
const sessionPath = path.join(sdkDir, 'session.js');
const clientPath = path.join(sdkDir, 'client.js');

try {
  if (!fs.existsSync(sessionPath)) {
    console.log('[patch-copilot-sdk] SDK not found, skipping patch');
    process.exit(0);
  }

  // Patch session.js: vscode-jsonrpc import
  let sessionContent = fs.readFileSync(sessionPath, 'utf8');
  if (!sessionContent.includes('"vscode-jsonrpc/node.js"')) {
    sessionContent = sessionContent.replace('"vscode-jsonrpc/node"', '"vscode-jsonrpc/node.js"');
    fs.writeFileSync(sessionPath, sessionContent, 'utf8');
    console.log('[patch-copilot-sdk] Patched vscode-jsonrpc import in session.js');
  }

  // Patch client.js: replace getBundledCliPath to not rely on import.meta.url
  // (webpack mangles import.meta.url in standalone builds)
  if (fs.existsSync(clientPath)) {
    let clientContent = fs.readFileSync(clientPath, 'utf8');

    // Match the entire function body by counting braces
    const fnStart = clientContent.indexOf('function getBundledCliPath()');
    let oldFnText = null;
    if (fnStart !== -1) {
      let depth = 0, i = fnStart;
      while (i < clientContent.length) {
        if (clientContent[i] === '{') depth++;
        else if (clientContent[i] === '}') { depth--; if (depth === 0) { oldFnText = clientContent.slice(fnStart, i + 1); break; } }
        i++;
      }
    }
    const oldFnRegex = oldFnText ? null : /function getBundledCliPath\(\)\s*\{[^}]+\}/;
    const newFn = `function getBundledCliPath() {
  const thisDir = dirname(fileURLToPath(import.meta.url));
  const relCandidate = join(thisDir, "..", "..", "copilot", "index.js");
  if (existsSync(relCandidate)) return relCandidate;
  const cwdCandidate = join(process.cwd(), "node_modules", "@github", "copilot", "index.js");
  if (existsSync(cwdCandidate)) return cwdCandidate;
  try {
    const sdkPath = fileURLToPath(import.meta.resolve("@github/copilot/sdk"));
    return join(dirname(dirname(sdkPath)), "index.js");
  } catch {}
  return relCandidate;
}`;

    if ((oldFnText || oldFnRegex?.test(clientContent)) && !clientContent.includes('thisDir, "..", "..", "copilot"')) {
      clientContent = oldFnText
        ? clientContent.replace(oldFnText, newFn)
        : clientContent.replace(oldFnRegex, newFn);
      fs.writeFileSync(clientPath, clientContent, 'utf8');
      console.log('[patch-copilot-sdk] Patched getBundledCliPath in client.js');
    }
  }
} catch (error) {
  console.error('[patch-copilot-sdk] Error:', error.message);
  process.exit(1);
}
