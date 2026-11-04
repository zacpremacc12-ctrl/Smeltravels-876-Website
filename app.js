// SMELTRAVELS876 - Hostinger Synchronous app.js Entry Point
// Compatible with Hostinger's LiteSpeed runner (/usr/local/lsws/fcgi-bin/lsnode.js)
// CRITICAL: Uses createRequire with NO top-level await to prevent ERR_REQUIRE_ASYNC_MODULE
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const target = path.join(__dirname, 'dist', 'server.cjs');

if (fs.existsSync(target)) {
  require(target);
} else {
  console.error('[SMELTRAVELS876] dist/server.cjs not found. Please run "npm run build".');
  process.exit(1);
}
