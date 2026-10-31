# SMELTRAVELS876 — Hostinger Production Deployment & Operations Guide

This guide details the production architecture, security requirements, and deployment procedures for SMELTRAVELS876 on Hostinger's Node.js Web App infrastructure.

---

## 1. Production Architecture Overview

SMELTRAVELS876 is an integrated full-stack application:
- **Frontend**: React 19 SPA built with Vite, TypeScript, and Tailwind CSS.
- **Backend**: Node.js & Express API server bundled into `dist/server.cjs` using esbuild.
- **Data Persistence**: Authoritative file store at `data/site-data.json` with atomic disk writes, startup backup snapshots (`data/backups/`), in-memory cache, and tombstone persistence for deleted inquiries.
- **Transactional Email**: Resend SDK integration sending from verified domains `bookings@smeltravels876.com` and `notifications@smeltravels876.com`.
- **Payment Processing**: WiPay Caribbean live payment gateway with server-side proxy checkout session generation and verified merchant link fallbacks.

```
                              [Client Browser]
                                     │
                                     ▼
                [Hostinger LiteSpeed / Apache Reverse Proxy]
                      (Binds to dynamic assigned PORT)
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
               Static Assets                    /api/* Routes
           (dist/index.html & assets/)         (Express Backend)
                                                     │
                                                     ▼
                                            [data/site-data.json]
                                         + [data/backups/ snapshots]
```

---

## 2. Hostinger Web App Configuration Settings

When configuring your Node.js application in Hostinger hPanel (**Websites > Manage > Node.js**):

| Setting | Exact Value to Enter | Notes |
| :--- | :--- | :--- |
| **Framework** | **Express** (or **Other**) | Hostinger detects and runs Express natively |
| **Node.js Version** | **22.x** (or **20.x LTS**) | Tested and fully compatible |
| **Application Root** | `/` (or root where files are placed) | Root folder containing `package.json` |
| **Application Startup File** | `dist/server.cjs` (or `server.cjs`) | Root `server.cjs`, `server.js`, and `app.js` bridge to `dist/server.cjs` |
| **Build Command** | `npm run build` | Compiles Vite frontend & bundles Express backend |
| **Output Directory** | `dist` | Contains compiled frontend and bundled server |
| **Run / Start Script** | `npm start` (or `node dist/server.cjs`) | Starts production Express server |

---

## 3. Server Port & Network Binding

- **No Hardcoded Reverse Proxy in `.htaccess`**:
  All hardcoded reverse proxy rules pointing to port 3000 have been completely removed from `.htaccess`.
- **Dynamic Hostinger Port Binding**:
  In `server.ts` / `dist/server.cjs`, the server listens dynamically on `process.env.PORT` provided by Hostinger (supporting both dynamic TCP port numbers and Unix domain sockets):
  ```javascript
  const rawPort = isAIStudioDevContainer ? 3000 : (process.env.PORT || 3000);
  const isSocket = typeof rawPort === 'string' && (rawPort.startsWith('/') || rawPort.startsWith('\\\\'));
  const PORT = isSocket ? rawPort : (Number(rawPort) || 3000);
  ```
- **LiteSpeed / Apache `.htaccess` Role**:
  `.htaccess` serves physical static files directly and routes client SPA URLs to `index.html`. It never rewrites `/api/*` to HTML or fake fallback JSON, ensuring API errors return genuine HTTP statuses.

---

## 4. Environment Variables Configuration

Configure these in Hostinger hPanel under **Node.js Application > Environment Variables** (or in a private `.env` file in the application root). **Never commit real credentials to source control or public repositories.**

```env
# Server Runtime
PORT=3000
NODE_ENV=production
APP_URL=https://smeltravels876.com

# Authoritative Administrator Password
# Required for admin portal authentication. Set a strong password.
ADMIN_PASSWORD=your_strong_admin_password_here

# Resend Transactional Email API Key
# Required to send live emails from bookings@ and notifications@smeltravels876.com
RESEND_API_KEY=your_live_resend_api_key_here

# WiPay Caribbean Payment Gateway
WIPAY_ACCOUNT_NUMBER=your_wipay_account_number_here
WIPAY_API_KEY=your_wipay_live_api_key_here
WIPAY_ENVIRONMENT=live
```

### Authorized Administrator Accounts
The server authorizes the following administrative accounts once authenticated with `ADMIN_PASSWORD`:
- **Elvoy Bennett** (`smeltravels876@gmail.com`) — CEO / Super Admin
- **Zachary Buchanan** (`zacpremacc12@gmail.com`, `zbuchanan.smeltravels@gmail.com`) — Travel Ambassador / Lead Admin
- **Jada Virgo** (`jvirgo.smeltravels@gmail.com`) — Travel Ambassador / Super Admin
- **Shenoya Davis** (`sdavis.smeltravels@gmail.com`) — Travel Ambassador / Super Admin

---

## 5. Data Storage & Protection of Live Customer Records

### Current Storage Architecture
- Authoritative data resides in `data/site-data.json`.
- Automatic safety snapshots are preserved under `data/backups/site-data-startup-<timestamp>.json` whenever the server starts.
- Clean installation fallback is provided by `data/site-data.template.json`.

### Critical Deployment Protection Rule
**When deploying updates or unzipping new code to Hostinger, NEVER overwrite an existing `data/site-data.json` file.**
- If `data/site-data.json` exists on your server, leave it untouched.
- The server will automatically load the existing live data, apply any active inquiry tombstones, and keep customer inquiries and bookings completely intact.

### Migration Plan to Persistent Centralized Storage
When scaling beyond single-instance file storage, the recommended path is migration to a centralized managed database:
1. **Target Options**:
   - **Firebase Firestore**: Scalable NoSQL document store with real-time listeners and multi-device sync.
   - **PostgreSQL / Cloud SQL**: Relational database with structured schemas for bookings, payments, and customer accounts.
2. **Safe Migration Protocol**:
   - **Phase 1 (Audit)**: Export current authoritative snapshot from `data/site-data.json`.
   - **Phase 2 (Approval Gate)**: Present schema definitions and migration script to administrators for formal review and approval. **No destructive changes or database overwrites may take place without explicit administrator authorization.**
   - **Phase 3 (Dual-Write)**: Mirror updates to both JSON store and centralized database.
   - **Phase 4 (Cutover)**: Switch primary reads to centralized database after verifying zero data loss.

---

## 6. How to Deploy to Hostinger

### Option A: Hostinger Git / GitHub Automatic Deployment (Recommended)
1. In Hostinger hPanel, go to **Websites > Manage > Node.js**.
2. Connect your repository.
3. Configure settings:
   - Framework: **Express**
   - Node.js version: **22**
   - Build command: `npm run build`
   - Startup file: `dist/server.cjs`
4. Under **Environment Variables**, add `ADMIN_PASSWORD`, `RESEND_API_KEY`, `WIPAY_ACCOUNT_NUMBER`, and `WIPAY_API_KEY`.
5. Click **Deploy**.

### Option B: Deploying via Production ZIP Package
1. Download the generated package `smeltravels876-hostinger-production.zip`.
2. In Hostinger File Manager:
   - Upload the ZIP into your website directory (e.g. `public_html`).
   - Extract the files.
   - **Verify:** If you already have a live `data/site-data.json`, do not replace it.
3. Open the Hostinger SSH Terminal or use the **NPM Install** button:
   ```bash
   npm install --omit=dev
   ```
4. Set the environment variables in hPanel.
5. Click **Start / Restart Application**.

---

## 7. Post-Deployment Verification Checklist

Run these tests immediately following deployment to confirm proper operation:

```bash
# 1. Verify Node.js server version and status (must return HTTP 200 JSON, never HTML)
curl -i https://smeltravels876.com/api/site-version

# 2. Verify site data endpoint (must return HTTP 200 JSON with site configuration)
curl -i https://smeltravels876.com/api/site-data

# 3. Verify Resend transactional email service status
curl -i https://smeltravels876.com/api/resend/status

# 4. Verify Administrator Login API endpoint
curl -i -X POST https://smeltravels876.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"zacpremacc12@gmail.com","password":"<your_configured_password>"}'
```

All API endpoints must return HTTP 200 JSON responses. If any endpoint returns HTML or 503, verify that the Node.js application process is active in Hostinger hPanel.
