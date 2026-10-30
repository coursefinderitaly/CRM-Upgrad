// Hostinger / Passenger startup entry point.
// Set this file as the "Application startup file" in Hostinger's Node.js panel.
const path = require('path');
const fs = require('fs');

const candidates = [
  path.join(__dirname, 'server', 'dist', 'server', 'src', 'index.js'),
  path.join(__dirname, 'server', 'dist', 'index.js'),
  path.join(__dirname, 'dist', 'server', 'src', 'index.js'),
  path.join(__dirname, 'dist', 'index.js'),
];

let entry = candidates.find((c) => fs.existsSync(c));

if (!entry) {
  console.log('[startup] Compiled server entry not found. Attempting npm run build...');
  try {
    const { execSync } = require('child_process');
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
    entry = candidates.find((c) => fs.existsSync(c));
  } catch (err) {
    console.error('[startup] Build attempt failed:', err.message);
  }
}

if (!entry) {
  console.error('[startup] CRITICAL: Could not find server entry file. Candidates:', candidates);
  const http = require('http');
  const port = process.env.PORT || 5000;
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Study Abroad CRM — Server Initializing</h1><p>The application is preparing assets. Please refresh in a moment or run <code>npm run build</code> in the host terminal.</p>');
  });
  server.listen(port, () => console.log(`[startup] Fallback server listening on port ${port}`));
} else {
  console.log('[startup] Booting CRM production server from:', entry);
  require(entry);
}

