const fs = require('fs');
const path = require('path');

const sessionPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@github',
  'copilot-sdk',
  'dist',
  'session.js'
);

try {
  if (!fs.existsSync(sessionPath)) {
    console.log('[patch-copilot-sdk] SDK not found, skipping patch');
    process.exit(0);
  }

  let content = fs.readFileSync(sessionPath, 'utf8');
  
  if (content.includes('"vscode-jsonrpc/node.js"')) {
    console.log('[patch-copilot-sdk] Already patched');
    process.exit(0);
  }

  content = content.replace(
    '"vscode-jsonrpc/node"',
    '"vscode-jsonrpc/node.js"'
  );

  fs.writeFileSync(sessionPath, content, 'utf8');
  console.log('[patch-copilot-sdk] Patched vscode-jsonrpc import');
} catch (error) {
  console.error('[patch-copilot-sdk] Error:', error.message);
  process.exit(1);
}
