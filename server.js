// SMELTRAVELS876 - Hostinger Node.js Production Entry Point
// Bridges Hostinger's default 'server.js' entry point to the bundled production server.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundledServer = path.join(__dirname, 'dist', 'server.cjs');

if (!fs.existsSync(bundledServer)) {
  console.error('[SMELTRAVELS876 Hostinger] dist/server.cjs not found! Please ensure "npm run build" completed.');
}

import('./dist/server.cjs').catch((err) => {
  console.error('[SMELTRAVELS876 Hostinger] Failed to bootstrap dist/server.cjs:', err);
  process.exit(1);
});
