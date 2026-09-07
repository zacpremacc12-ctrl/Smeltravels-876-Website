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

// --- API ROUTES FIRST ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET all live site data (settings, trips, bookings, inbox, etc.)
app.get('/api/site-data', (req, res) => {
  res.json({
    success: true,
    data: siteDataCache,
  });
});

// POST update live site data
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
      return res.json({ success: true, message: 'Live data successfully persisted to server' });
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
    persistData();

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
    persistData();
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
    persistData();
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
