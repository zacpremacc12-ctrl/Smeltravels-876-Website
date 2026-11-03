# SMELTRAVELS876 Hostinger Deployment - READ FIRST

## 1. LiteSpeed lsnode.js & ERR_REQUIRE_ASYNC_MODULE Fix

Hostinger's LiteSpeed runner (`/usr/local/lsws/fcgi-bin/lsnode.js`) launches applications by synchronously calling `require(entry_file)`.

Previously, `server.js` and `app.js` contained top-level await (`await import('./dist/server.cjs');`). Node.js 22 forbids `require()` on an ESM module with top-level await, causing the fatal crash:
```text
Error [ERR_REQUIRE_ASYNC_MODULE]: require() cannot be used on an ESM graph with top-level await. Use import() instead.
From: /usr/local/lsws/fcgi-bin/lsnode.js
Requiring: .../nodejs/server.js
```

### The Fix Applied
- **Removed top-level await**: Replaced `await import(...)` in `server.js` and `app.js` with Node's synchronous `createRequire(import.meta.url)`.
- **Synchronous Entry Points**: `server.js`, `server.cjs`, `app.js`, and `app.cjs` can now all be safely and synchronously loaded by LiteSpeed's `lsnode.js` with **zero** `ERR_REQUIRE_ASYNC_MODULE` errors.
- **`dist/` Tracked in Git**: `dist/` is now tracked and built in the repository, guaranteeing `dist/server.cjs` and all frontend assets exist immediately upon clone or pull on Hostinger.

---

## 2. Hostinger hPanel Settings (Express Framework)

When Hostinger Support configured your application classification as **Express**:

- **Repository**: `zacpremacc12-ctrl/Smeltravels-876-Website`
- **Branch**: `main`
- **Framework**: **Express**
- **Node.js Version**: **22**
- **Application Root**: `/`
- **Application Startup File**: `server.js` (or `server.cjs`, `app.js`, `dist/server.cjs`)
- **Package main**: `server.js`
- **Run / Start Script**: `npm start` (or `node server.js`)
- **Build Command**: `npm run build`

---

## 3. Required Hostinger Environment Variables

Set these under **Node.js > Environment Variables** in Hostinger hPanel:
```env
PORT=3000
NODE_ENV=production
ADMIN_PASSWORD=<your_secure_password>
RESEND_API_KEY=<your_resend_api_key>
WIPAY_ACCOUNT_NUMBER=<your_wipay_account_number>
WIPAY_API_KEY=<your_wipay_api_key>
```

---

## 4. Verification Checklist
- `node -e "require('./server.js')"` — PASSED (HTTP 200 OK, zero async module errors)
- `node -e "require('./server.cjs')"` — PASSED (HTTP 200 OK)
- `node -e "require('./app.js')"` — PASSED (HTTP 200 OK)
- `node -e "require('./dist/server.cjs')"` — PASSED (HTTP 200 OK)
- `GET /api/health` — Responding `200 OK`
- `GET /api/site-version` — Responding `200 OK`
- `GET /api/site-data` — Responding `200 OK`
- `POST /api/admin/login` — Authenticates valid administrator credentials
