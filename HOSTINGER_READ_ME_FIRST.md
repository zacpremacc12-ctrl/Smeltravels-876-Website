# SMELTRAVELS876 Hostinger deployment - READ FIRST

This package is **source code**, not a deployed executable. Do not extract it into `hbuilds/current`.

## Required Hostinger settings
- Source: GitHub branch containing this project
- Framework: **Other**
- Node.js: **22**
- Build command: **npm run build**
- Output directory: **dist** (if Hostinger offers the field)
- Entry file: **server.cjs** (inside the output directory)
- `PORT`: use Hostinger-assigned port (existing 3000 is fine if that's what hPanel shows)
- `ADMIN_PASSWORD`: set securely in Hostinger environment variables; **not in source or ZIP**

The build generates `dist/index.html`, `dist/assets/`, and `dist/server.cjs`. Root `server.js` and `server.cjs` launcher wrappers were intentionally removed to avoid an incorrect `require('./dist/server.cjs')` from an output directory that is already `dist`.

## Required before deploying
1. Back up all existing live data from Hostinger, including `data/site-data.json` and existing backups. This ZIP deliberately **does not include** production data or original test data.
2. Verify where your live data will persist across deployments. The current app still uses local file storage: a persistent DB/storage migration is recommended; this package does NOT complete such a migration.
3. Verify your Hostinger domain/backend routing. A 503 served by Hostinger's reverse proxy cannot be confirmed fixed without a live deployment and checking its logs.
4. Deploy to a staging/test branch first if available, then check `/api/health`, `/api/site-version`, `/api/site-data` and POST `/api/admin/login` with your existing credentials. Do not share credentials or tokens.
5. If login returns HTTP 500 with missing `ADMIN_PASSWORD`, configure that environment variable in Hostinger and restart.

## Code changes
- Remove root launcher wrappers that could point to nonexistent nested `dist` directories.
- Public SSE and public site-data responses no longer transmit admin sessions and selected private collections.
- Add startup error logging for failure to initialize Express.
- Exclude live data snapshots and duplicate nested deployment ZIPs.

## Verification limits
Static source checks completed. A full npm build and Hostinger live login verification were not available in the build environment, so this is NOT guaranteed to resolve every 503. If `/api/health` still returns 503, investigate Hostinger's proxy and runtime process with Hostinger support.
