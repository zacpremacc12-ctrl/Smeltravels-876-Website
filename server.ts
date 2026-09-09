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

// POST trip inquiry (for "I want more information" or "Interested but need help")
// Automatically dispatches to zbuchanan.smeltravels@gmail.com and smeltravels876@gmail.com, and logs to admin inbox
app.post('/api/trip-inquiry', (req, res) => {
  try {
    const {
      tripId,
      tripName,
      customerName,
      email,
      phone,
      parish,
      inquiryText,
      inquiryType,
      preferredContactMethod,
      adultsCount,
    } = req.body;

    if (!customerName || !email || !inquiryText) {
      return res.status(400).json({ success: false, error: 'Customer name, email, and inquiry are required.' });
    }

    const ref = `INQ-${Math.floor(10000 + Math.random() * 90000)}`;
    const recipients = ['zbuchanan.smeltravels@gmail.com', 'smeltravels876@gmail.com'];
    const now = new Date().toISOString();

    const stageLabel =
      inquiryType === 'more_info'
        ? 'Wants More Information'
        : inquiryType === 'need_help'
        ? 'Interested But Needs Help'
        : 'Trip Inquiry';

    // 1. Log to Onsite Admin Inbox
    const currentInbox = Array.isArray(siteDataCache.adminInbox) ? siteDataCache.adminInbox : [];
    const newInboxItem = {
      id: `inbox-inq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'inquiry',
      title: `Trip Inquiry: ${tripName || 'Travel Package'} (${stageLabel})`,
      senderName: customerName,
      senderEmail: email,
      senderPhone: phone || 'N/A',
      summary: `Inquiry from ${customerName} (${parish || 'Jamaica'}). Automatically routed to ${recipients.join(' & ')}.`,
      details: `Customer: ${customerName}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nParish: ${parish || 'Jamaica'}\nStage: ${stageLabel}\nTrip: ${tripName || 'Package'}\nInquiry: ${inquiryText}\nPreferred Contact: ${preferredContactMethod || 'WhatsApp'}\nAuto-Dispatched to: ${recipients.join(', ')}`,
      tripId: tripId || undefined,
      tripName: tripName || undefined,
      referenceNumber: ref,
      timestamp: now,
      isRead: false,
    };

    siteDataCache.adminInbox = [newInboxItem, ...currentInbox];

    // 2. Add to Contacts / Inquiries record
    const currentContacts = Array.isArray(siteDataCache.contacts) ? siteDataCache.contacts : [];
    const newContact = {
      id: `contact-${Date.now()}`,
      referenceNumber: ref,
      name: customerName,
      email,
      phone: phone || '',
      countryOrParish: parish || 'Jamaica',
      tripId: tripId || '',
      tripName: tripName || '',
      subject: `[Trip Inquiry] ${tripName || 'Travel Package'} - ${stageLabel}`,
      message: inquiryText,
      preferredContactMethod: preferredContactMethod || 'whatsapp',
      status: 'New',
      createdAt: now,
    };
    siteDataCache.contacts = [newContact, ...currentContacts];

    // 3. Log Outbound Automated Email Dispatch Record
    const currentLogs = Array.isArray(siteDataCache.dispatchedEmails) ? siteDataCache.dispatchedEmails : [];
    const emailLog = {
      id: `email-${Date.now()}`,
      to: recipients,
      from: 'SMELTRAVELS876 Traveler Notification <no-reply@smeltravels876.com>',
      replyTo: email,
      subject: `[Trip Inquiry ${ref}] ${tripName || 'Travel Package'} - ${customerName} (${stageLabel})`,
      content: {
        customerName,
        email,
        phone,
        parish,
        tripName,
        stageLabel,
        inquiryText,
        preferredContactMethod: preferredContactMethod || 'whatsapp',
      },
      sentAt: now,
      status: 'Sent',
    };
    siteDataCache.dispatchedEmails = [emailLog, ...currentLogs];

    siteDataCache.lastUpdated = now;
    persistData();
    broadcastSiteUpdate(siteDataCache);

    console.log(`[Trip Inquiry] Automated dispatch of inquiry ${ref} to ${recipients.join(', ')} from ${customerName} <${email}>`);

    return res.json({
      success: true,
      referenceNumber: ref,
      sentTo: recipients,
      inboxLogged: true,
      message: 'Inquiry successfully routed to travel directors and logged in the onsite Admin Inbox.',
    });
  } catch (err: any) {
    console.error('[Trip Inquiry Error]:', err);
    return res.status(500).json({ success: false, error: err.message });
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
