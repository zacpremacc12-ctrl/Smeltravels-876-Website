// SMELTRAVELS876 - Hostinger Root app.cjs Entry Point
// Bridges Hostinger hPanel when Startup File is configured as 'app.cjs'
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'dist', 'server.cjs');
if (fs.existsSync(target)) {
  require(target);
} else {
  console.error('[SMELTRAVELS876] dist/server.cjs not found. Please run "npm run build".');
  process.exit(1);
}
