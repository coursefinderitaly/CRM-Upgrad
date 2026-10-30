// Hostinger / Passenger startup entry point.
// The real server is compiled to server/dist/server/src/index.js by `npm run build`.
// Set this file as the "Application startup file" in Hostinger's Node.js panel.
const path = require('path');
const fs = require('fs');

const entry = path.join(__dirname, 'server', 'dist', 'server', 'src', 'index.js');

if (!fs.existsSync(entry)) {
  console.error('[startup] Build output not found:', entry);
  console.error('[startup] Run "npm install --include=dev && npm run build" before starting the app.');
  process.exit(1);
}

require(entry);
