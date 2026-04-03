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

  // Patch client.js: replace import.meta.resolve("@github/copilot/sdk") with relative URL resolution
  if (fs.existsSync(clientPath)) {
    let clientContent = fs.readFileSync(clientPath, 'utf8');
    const marker = 'import.meta.resolve("@github/copilot/sdk")';
    if (clientContent.includes(marker)) {
      // Resolve relative to client.js at @github/copilot-sdk/dist/client.js
      // ../../copilot/sdk/index.js -> @github/copilot/sdk/index.js
      const replacement = 'new URL("../../copilot/sdk/index.js", import.meta.url).href';
      clientContent = clientContent.replace(marker, replacement);
      fs.writeFileSync(clientPath, clientContent, 'utf8');
      console.log('[patch-copilot-sdk] Patched import.meta.resolve in client.js');
    }
  }
} catch (error) {
  console.error('[patch-copilot-sdk] Error:', error.message);
  process.exit(1);
}
