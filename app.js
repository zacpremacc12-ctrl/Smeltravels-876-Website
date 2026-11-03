// SMELTRAVELS876 - Hostinger Root app.js Entry Point
// Bridges Hostinger hPanel when Startup File is configured as 'app.js'
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(__dirname, 'dist', 'server.cjs');

if (fs.existsSync(target)) {
  await import('./dist/server.cjs');
} else {
  console.error('[SMELTRAVELS876] dist/server.cjs not found. Please run "npm run build".');
  process.exit(1);
}
