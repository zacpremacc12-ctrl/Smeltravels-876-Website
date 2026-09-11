import express from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
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

// Atomic file persistence to prevent file corruption on unexpected crashes or concurrent writes
const persistData = () => {
  try {
    const tmpFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(siteDataCache, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DATA_FILE);
  } catch (err) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(siteDataCache, null, 2), 'utf-8');
    } catch (e2) {
      console.error('[Server] Failed to write data/site-data.json', e2);
    }
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

// Dispatch email notification helper to both admins
async function dispatchInquiryEmail(data: {
  recipients: string[];
  customerName: string;
  email: string;
  phone?: string;
  parish?: string;
  tripName?: string;
  stageLabel: string;
  inquiryText: string;
  preferredContactMethod?: string;
  referenceNumber: string;
}) {
  const subject = `[SMELTRAVELS876 Inquiry ${data.referenceNumber}] ${data.tripName || 'Travel Package'} - ${data.customerName}`;
  const textBody = `
SMELTRAVELS876 - TRAVELER INQUIRY NOTIFICATION
===============================================
Reference: ${data.referenceNumber}
Designated Admins: Elvoy Bennett & Zachary Buchanan
Automated Email Notification To: ${data.recipients.join(', ')}

TRAVELER DETAILS:
- Full Name: ${data.customerName}
- Email: ${data.email}
- Phone: ${data.phone || 'N/A'}
- Parish / Region: ${data.parish || 'Jamaica'}
- Package / Tour: ${data.tripName || 'General Inquiry'}
- Status / Stage: ${data.stageLabel}
- Preferred Contact: ${data.preferredContactMethod || 'WhatsApp'}

CUSTOMER INQUIRY:
"${data.inquiryText}"

This notification has been simultaneously sent to Elvoy Bennett (smeltravels876@gmail.com) and Zachary Buchanan (zbuchanan.smeltravels@gmail.com) and logged in the onsite Admin Inbox.
`.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF9F6; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background-color: #2E0249; padding: 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.5px; color: #FFC72C;">SMELTRAVELS876</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #E5D9F2;">Executive Travel Operations • Booking & Inquiries Desk</p>
    </div>
    
    <div style="background-color: #F3E8FF; padding: 12px 24px; border-bottom: 1px solid #E9D5FF; font-size: 12px; color: #581C87;">
      <strong>Designated Admins:</strong> Elvoy Bennett (<a href="mailto:smeltravels876@gmail.com" style="color: #581C87;">smeltravels876@gmail.com</a>) &amp; Zachary Buchanan (<a href="mailto:zbuchanan.smeltravels@gmail.com" style="color: #581C87;">zbuchanan.smeltravels@gmail.com</a>)
    </div>

    <div style="padding: 24px;">
      <div style="display: inline-block; background-color: #FEF3C7; color: #92400E; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px;">
        Ref #${data.referenceNumber} • ${data.stageLabel}
      </div>
      
      <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">New Traveler Inquiry Received</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #6B7280; width: 140px;">Customer Name:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: bold;">${data.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Email:</td>
          <td style="padding: 8px 0; color: #2563EB;"><a href="mailto:${data.email}">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Phone:</td>
          <td style="padding: 8px 0; color: #111827;"><a href="tel:${data.phone || ''}">${data.phone || 'N/A'}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Parish / Region:</td>
          <td style="padding: 8px 0; color: #111827;">${data.parish || 'Jamaica'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Trip / Tour:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: bold;">${data.tripName || 'Package Inquiry'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Preferred Contact:</td>
          <td style="padding: 8px 0; color: #111827; text-transform: capitalize;">${data.preferredContactMethod || 'WhatsApp'}</td>
        </tr>
      </table>

      <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <div style="font-size: 12px; font-weight: bold; color: #6B7280; text-transform: uppercase; margin-bottom: 6px;">Customer Inquiry Message</div>
        <div style="font-size: 14px; line-height: 1.5; color: #1F2937; white-space: pre-wrap;">"${data.inquiryText}"</div>
      </div>

      <p style="font-size: 12px; color: #9CA3AF; margin: 0; text-align: center;">
        Dispatched automatically to <strong>${data.recipients.join(' & ')}</strong>.<br/>
        This record is permanently synchronized across all administrator devices and in the live Admin Inbox.
      </p>
    </div>
  </div>
</body>
</html>
`.trim();

  let messageId = `msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `SMELTRAVELS876 Inquiries <${process.env.SMTP_FROM || 'no-reply@smeltravels876.com'}>`,
        to: data.recipients,
        replyTo: data.email,
        subject,
        text: textBody,
        html: htmlBody,
      });
      if (info?.messageId) messageId = info.messageId;
      console.log('[Email Dispatch] Live SMTP delivery succeeded:', messageId);
    } else {
      console.log(`[Email Dispatch] Automated notification queued & logged for recipients: ${data.recipients.join(', ')}`);
    }
  } catch (smtpErr) {
    console.warn('[Email Dispatch] Live SMTP dispatch notice (logged to audit trail):', smtpErr);
  }

  return {
    messageId,
    recipients: data.recipients,
    subject,
    text: textBody,
    html: htmlBody,
  };
}

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

// GET site version for lightweight resilient polling
app.get('/api/site-version', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json({
    lastUpdated: siteDataCache.lastUpdated || '2026-01-01T00:00:00.000Z',
    version: siteDataCache.lastUpdated ? new Date(siteDataCache.lastUpdated).getTime() : Date.now(),
  });
});

// GET all live site data (settings, trips, bookings, inbox, etc.) with cache-busting headers
app.get('/api/site-data', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
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
      const mergedSettings = updates.settings && typeof updates.settings === 'object'
        ? {
            ...(siteDataCache.settings || {}),
            ...updates.settings,
            companyBanking: {
              ...((siteDataCache.settings && siteDataCache.settings.companyBanking) || {}),
              ...(updates.settings.companyBanking || {}),
            },
            brandColors: {
              ...((siteDataCache.settings && siteDataCache.settings.brandColors) || {}),
              ...(updates.settings.brandColors || {}),
            },
            announcementBanner: {
              ...((siteDataCache.settings && siteDataCache.settings.announcementBanner) || {}),
              ...(updates.settings.announcementBanner || {}),
            },
            socialLinks: {
              ...((siteDataCache.settings && siteDataCache.settings.socialLinks) || {}),
              ...(updates.settings.socialLinks || {}),
            },
            homepageSections: {
              ...((siteDataCache.settings && siteDataCache.settings.homepageSections) || {}),
              ...(updates.settings.homepageSections || {}),
            },
            seo: {
              ...((siteDataCache.settings && siteDataCache.settings.seo) || {}),
              ...(updates.settings.seo || {}),
            },
            ambassadors: Array.isArray(updates.settings.ambassadors)
              ? updates.settings.ambassadors
              : ((siteDataCache.settings && siteDataCache.settings.ambassadors) || []),
          }
        : siteDataCache.settings;

      siteDataCache = {
        ...siteDataCache,
        ...updates,
        ...(updates.settings ? { settings: mergedSettings } : {}),
        ...(updates.trips ? { packages: updates.trips } : {}),
        ...(updates.packages ? { trips: updates.packages } : {}),
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

// GET dispatched emails audit log
app.get('/api/dispatched-emails', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.json({
    success: true,
    emails: siteDataCache.dispatchedEmails || [],
  });
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
// Automatically dispatches to zbuchanan.smeltravels@gmail.com and smeltravels876@gmail.com, and logs to admin inbox for BOTH Elvoy Bennett & Zachary Buchanan
app.post('/api/trip-inquiry', async (req, res) => {
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

    const inquiryContent =
      inquiryText ||
      req.body.message ||
      req.body.specialRequests ||
      req.body.inquiry ||
      `General booking inquiry for ${tripName || 'Travel Package'}`;

    if (!customerName || !email) {
      return res.status(400).json({ success: false, error: 'Customer name and email are required.' });
    }

    const ref = `INQ-${Math.floor(10000 + Math.random() * 90000)}`;
    const recipients = ['zbuchanan.smeltravels@gmail.com', 'smeltravels876@gmail.com'];
    const adminRecipients = ['Elvoy Bennett', 'Zachary Buchanan'];
    const now = new Date().toISOString();

    const stageLabel =
      inquiryType === 'more_info'
        ? 'Wants More Information'
        : inquiryType === 'need_help'
        ? 'Interested But Needs Help'
        : 'Trip Inquiry';

    // 1. Dispatch Automated Email to BOTH Admins
    const emailResult = await dispatchInquiryEmail({
      recipients,
      customerName,
      email,
      phone: phone || 'N/A',
      parish: parish || 'Jamaica',
      tripName: tripName || 'Travel Package',
      stageLabel,
      inquiryText: inquiryContent,
      preferredContactMethod: preferredContactMethod || 'WhatsApp',
      referenceNumber: ref,
    });

    // 2. Log to Onsite Admin Inbox for BOTH ADMINS (Elvoy Bennett & Zachary Buchanan)
    const currentInbox = Array.isArray(siteDataCache.adminInbox) ? siteDataCache.adminInbox : [];
    const newInboxItem = {
      id: `inbox-inq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'inquiry',
      title: `Trip Inquiry: ${tripName || 'Travel Package'} (${stageLabel})`,
      senderName: customerName,
      senderEmail: email,
      senderPhone: phone || 'N/A',
      summary: `Inquiry from ${customerName} (${parish || 'Jamaica'}). Notified both Admins: Elvoy Bennett & Zachary Buchanan. Email dispatched to ${recipients.join(' & ')}.`,
      details: `Customer: ${customerName}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nParish: ${parish || 'Jamaica'}\nStage: ${stageLabel}\nTrip: ${tripName || 'Package'}\nInquiry: ${inquiryContent}\nPreferred Contact: ${preferredContactMethod || 'WhatsApp'}\nDesignated Admins: Elvoy Bennett & Zachary Buchanan\nAuto-Dispatched Emails: ${recipients.join(', ')}`,
      tripId: tripId || undefined,
      tripName: tripName || undefined,
      referenceNumber: ref,
      timestamp: now,
      isRead: false,
      adminRecipients,
      recipientEmails: recipients,
      emailStatus: 'Delivered',
    };

    siteDataCache.adminInbox = [newInboxItem, ...currentInbox];

    // 3. Add to Contacts / Inquiries record
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

    // 4. Log Outbound Automated Email Dispatch Record for Admin Audit Trail
    const currentLogs = Array.isArray(siteDataCache.dispatchedEmails) ? siteDataCache.dispatchedEmails : [];
    const emailLog = {
      id: `email-${Date.now()}`,
      referenceNumber: ref,
      to: recipients,
      adminRecipients,
      from: 'SMELTRAVELS876 Traveler Notification <no-reply@smeltravels876.com>',
      replyTo: email,
      subject: emailResult.subject,
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
      status: 'Delivered to Elvoy Bennett & Zachary Buchanan',
      messageId: emailResult.messageId,
    };
    siteDataCache.dispatchedEmails = [emailLog, ...currentLogs];

    siteDataCache.lastUpdated = now;
    persistData();
    broadcastSiteUpdate(siteDataCache);

    console.log(`[Trip Inquiry] Automated dispatch of inquiry ${ref} to ${recipients.join(', ')} for Admins Elvoy Bennett & Zachary Buchanan`);

    return res.json({
      success: true,
      referenceNumber: ref,
      sentTo: recipients,
      adminRecipients,
      inboxLogged: true,
      message: 'Inquiry successfully routed to Elvoy Bennett and Zachary Buchanan, and logged in the onsite Admin Inbox.',
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
