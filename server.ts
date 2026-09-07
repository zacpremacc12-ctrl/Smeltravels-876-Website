import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'site-data.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache synced with data/site-data.json
let siteDataCache: Record<string, any> = {};

try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    siteDataCache = JSON.parse(raw);
    console.log('[Server] Loaded live store from data/site-data.json');
  }
} catch (err) {
  console.error('[Server] Failed to read initial site-data.json, starting fresh', err);
}

const persistData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(siteDataCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed to write data/site-data.json', err);
  }
};

// Connected clients for Server-Sent Events (Real-time live feed for all users)
const sseClients = new Set<express.Response>();

const broadcastSiteUpdate = (data: any) => {
  const payload = JSON.stringify({
    type: 'SITE_DATA_UPDATE',
    data,
    lastUpdated: siteDataCache.lastUpdated,
  });
  const message = `data: ${payload}\n\n`;

  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (err) {
      sseClients.delete(client);
    }
  }
};

// --- API ROUTES FIRST ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET real-time SSE stream for ALL connected users (logged in or not)
app.get('/api/site-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Prevents proxy/reverse-proxy buffering
  res.flushHeaders();

  // Send current state immediately on connect
  res.write(
    `data: ${JSON.stringify({
      type: 'INIT',
      data: siteDataCache,
      lastUpdated: siteDataCache.lastUpdated || new Date().toISOString(),
    })}\n\n`
  );

  sseClients.add(res);

  // Heartbeat ping every 15 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (e) {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// GET all live site data (settings, trips, bookings, inbox, etc.) with cache-busting headers
app.get('/api/site-data', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json({
    success: true,
    data: siteDataCache,
    lastUpdated: siteDataCache.lastUpdated || new Date().toISOString(),
  });
});

// POST update live site data - immediately persists and broadcasts to ALL users
app.post('/api/site-data', (req, res) => {
  try {
    const updates = req.body;
    if (updates && typeof updates === 'object') {
      siteDataCache = {
        ...siteDataCache,
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      persistData();
      broadcastSiteUpdate(siteDataCache);
      console.log(`[Server] Live site data updated & broadcast to ${sseClients.size} connected users`);
      return res.json({
        success: true,
        message: 'Live data successfully persisted to server and broadcast to all users',
        lastUpdated: siteDataCache.lastUpdated,
      });
    }
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST append to Admin Inbox (for inquiries, deposits, reviews, messages)
app.post('/api/inbox', (req, res) => {
  try {
    const item = req.body;
    if (!item || !item.type || !item.title) {
      return res.status(400).json({ success: false, error: 'Missing required notification fields' });
    }

    const currentInbox = Array.isArray(siteDataCache.adminInbox) ? siteDataCache.adminInbox : [];
    const newItem = {
      ...item,
      id: item.id || `inbox-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: item.timestamp || new Date().toISOString(),
      isRead: false,
    };

    siteDataCache.adminInbox = [newItem, ...currentInbox];
    siteDataCache.lastUpdated = new Date().toISOString();
    persistData();
    broadcastSiteUpdate(siteDataCache);

    res.json({ success: true, item: newItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH mark inbox item as read
app.patch('/api/inbox/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    const currentInbox = Array.isArray(siteDataCache.adminInbox) ? siteDataCache.adminInbox : [];
    siteDataCache.adminInbox = currentInbox.map((item: any) =>
      item.id === id ? { ...item, isRead: true } : item
    );
    siteDataCache.lastUpdated = new Date().toISOString();
    persistData();
    broadcastSiteUpdate(siteDataCache);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE inbox item
app.delete('/api/inbox/:id', (req, res) => {
  try {
    const { id } = req.params;
    const currentInbox = Array.isArray(siteDataCache.adminInbox) ? siteDataCache.adminInbox : [];
    siteDataCache.adminInbox = currentInbox.filter((item: any) => item.id !== id);
    siteDataCache.lastUpdated = new Date().toISOString();
    persistData();
    broadcastSiteUpdate(siteDataCache);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- VITE / STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SMELTRAVELS876] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
