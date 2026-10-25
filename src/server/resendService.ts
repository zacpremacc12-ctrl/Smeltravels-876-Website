import dotenv from 'dotenv';
dotenv.config();

import { Resend } from 'resend';

export const RESEND_SENDERS = {
  BOOKINGS: 'SMELTRAVELS876 Bookings <bookings@smeltravels876.com>',
  NOTIFICATIONS: 'SMELTRAVELS876 Security & Accounts <notifications@smeltravels876.com>',
} as const;

export type EmailTemplateType =
  | 'inquiry_customer'
  | 'inquiry_admin'
  | 'booking_customer'
  | 'booking_admin'
  | 'custom_trip_customer'
  | 'custom_trip_admin'
  | 'welcome_account'
  | 'security_alert'
  | 'test_email';

export interface EmailLogEntry {
  id: string;
  templateType: EmailTemplateType;
  sender: string;
  recipient: string | string[];
  subject: string;
  status: 'Delivered' | 'Queued' | 'Simulated' | 'Failed';
  messageId?: string;
  error?: string;
  timestamp: string;
  htmlContent?: string;
  referenceNumber?: string;
  customerName?: string;
}

export interface SendEmailOptions {
  type: EmailTemplateType;
  to: string | string[];
  sender?: string;
  replyTo?: string;
  subject?: string;
  data: Record<string, any>;
}

// Brand constants for emails
const BRAND = {
  name: 'SMELTRAVELS876',
  tagline: 'Luxury Group Travel & Curated Jamaican Experiences',
  phone: '(876) 834-1537',
  whatsapp: '18768341537',
  website: 'https://smeltravels876.com',
  primaryColor: '#2E0249',
  accentGold: '#FFC72C',
  bgDark: '#190028',
  bgLight: '#FAF9F6',
  cardBg: '#FFFFFF',
  textDark: '#1E293B',
  textMuted: '#64748B',
};

// Reusable branded wrapper
function wrapEmailTemplate({
  title,
  preheader,
  bodyHtml,
  senderBadge,
}: {
  title: string;
  preheader: string;
  bodyHtml: string;
  senderBadge: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${BRAND.bgLight}; margin: 0; padding: 20px; color: ${BRAND.textDark}; }
    .wrapper { max-width: 620px; margin: 0 auto; background: ${BRAND.cardBg}; border-radius: 18px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.bgDark} 100%); padding: 32px 28px; text-align: center; color: #FFFFFF; position: relative; }
    .logo-badge { display: inline-block; background: rgba(255, 199, 44, 0.15); border: 1px solid rgba(255, 199, 44, 0.4); color: ${BRAND.accentGold}; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 14px; border-radius: 9999px; margin-bottom: 12px; }
    .brand-title { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 0.5px; color: ${BRAND.accentGold}; }
    .brand-tagline { margin: 8px 0 0 0; font-size: 13px; color: #E2E8F0; font-weight: 500; }
    .sender-ribbon { background-color: #F1F5F9; padding: 10px 24px; border-bottom: 1px solid #E2E8F0; font-size: 11px; font-weight: 600; color: #475569; display: flex; justify-content: space-between; }
    .content { padding: 32px 28px; }
    .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; margin: 20px 0; }
    .table-details { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
    .table-details td { padding: 8px 0; border-bottom: 1px dashed #E2E8F0; }
    .table-details td:last-child { text-align: right; font-weight: 700; color: ${BRAND.textDark}; }
    .table-details td:first-child { color: ${BRAND.textMuted}; }
    .btn { display: inline-block; background: ${BRAND.primaryColor}; color: ${BRAND.accentGold} !important; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 12px; margin: 16px 0; text-align: center; letter-spacing: 0.3px; border: 1px solid rgba(255,199,44,0.3); }
    .footer { background-color: #0F172A; padding: 26px 24px; text-align: center; font-size: 12px; color: #94A3B8; line-height: 1.6; }
    .footer a { color: ${BRAND.accentGold}; text-decoration: none; }
  </style>
</head>
<body>
  <!-- Preheader text for inbox preview -->
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>

  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <div class="logo-badge">Official Transactional Notification</div>
      <h1 class="brand-title">${BRAND.name}</h1>
      <p class="brand-tagline">${BRAND.tagline}</p>
    </div>

    <!-- Sender Channel Ribbon -->
    <div class="sender-ribbon">
      <span>Official Sender: <strong>${senderBadge}</strong></span>
      <span>Verified Domain: <strong>smeltravels876.com</strong></span>
    </div>

    <!-- Main Content Body -->
    <div class="content">
      ${bodyHtml}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 8px 0; color: #F1F5F9; font-weight: 700;">
        SMELTRAVELS876 LIMITED • Kingston, Jamaica
      </p>
      <p style="margin: 0 0 12px 0;">
        Direct Assistance: <a href="tel:${BRAND.phone}">${BRAND.phone}</a> | 
        WhatsApp Concierge: <a href="https://wa.me/${BRAND.whatsapp}">Chat on WhatsApp</a> | 
        Web: <a href="${BRAND.website}">smeltravels876.com</a>
      </p>
      <p style="margin: 0; font-size: 11px; color: #64748B;">
        This automated transactional notification was delivered by the official Resend API on behalf of SMELTRAVELS876.<br/>
        &copy; ${new Date().getFullYear()} SMELTRAVELS876. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;
}

// Generate HTML & Text for each template type
export function renderEmailTemplate(type: EmailTemplateType, data: Record<string, any>): {
  subject: string;
  html: string;
  text: string;
  defaultSender: string;
} {
  const ref = data.referenceNumber || `ST-${Date.now().toString().slice(-6)}`;
  const customerName = data.customerName || data.name || 'Valued Traveler';
  const customerEmail = data.email || data.customerEmail || '';

  switch (type) {
    // 1. Customer Enquiry Confirmation
    case 'inquiry_customer': {
      const tripName = data.tripName || 'Travel Package';
      const subject = `Inquiry Confirmed: ${tripName} (Ref: ${ref}) — SMELTRAVELS876`;
      const preheader = `We received your inquiry #${ref} for ${tripName}. A travel ambassador is reviewing your request.`;
      const defaultSender = RESEND_SENDERS.BOOKINGS;

      const bodyHtml = `
        <h2 style="margin: 0 0 10px 0; font-size: 20px; color: ${BRAND.primaryColor}; font-weight: 800;">
          Thank You, ${customerName}!
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: ${BRAND.textDark}; margin: 0 0 16px 0;">
          We have received your travel inquiry for <strong>${tripName}</strong>. Your assigned travel ambassador has been notified and will reach out with complete package details and dates.
        </p>

        <div class="card">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748B; margin-bottom: 8px;">
            Inquiry Summary
          </div>
          <table class="table-details">
            <tr>
              <td>Reference Code:</td>
              <td><span style="font-family: monospace; background: #E2E8F0; padding: 2px 8px; border-radius: 6px;">#${ref}</span></td>
            </tr>
            <tr>
              <td>Package / Tour:</td>
              <td>${tripName}</td>
            </tr>
            <tr>
              <td>Preferred Travel Window:</td>
              <td>${data.preferredTravelDate || 'Flexible 2026/2027'}</td>
            </tr>
            <tr>
              <td>Travelers:</td>
              <td>${data.adultsCount || 1} Adult(s)${data.childrenCount ? `, ${data.childrenCount} Children` : ''}</td>
            </tr>
            <tr>
              <td>Preferred Contact:</td>
              <td style="text-transform: capitalize;">${data.preferredContactMethod || 'WhatsApp'}</td>
            </tr>
            ${data.specialRequests ? `
            <tr>
              <td>Your Message:</td>
              <td style="font-weight: normal; font-style: italic;">"${data.specialRequests}"</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="background: #FEF9C3; border: 1px solid #FDE047; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 6px 0; color: #854D0E; font-size: 13px; font-weight: 800;">What Happens Next?</h4>
          <p style="margin: 0; font-size: 12px; color: #713F12; line-height: 1.5;">
            Our reservations team will review airline availability and resort allotments for your requested travel dates. You can also track your inquiry status anytime on our website using reference code <strong>#${ref}</strong>.
          </p>
        </div>

        <div style="text-align: center;">
          <a href="${BRAND.website}" class="btn">Track Your Inquiry on Website &rarr;</a>
        </div>
      `;

      const text = `
SMELTRAVELS876 - INQUIRY CONFIRMATION
Reference: #${ref}
Package: ${tripName}
Customer: ${customerName}
Email: ${customerEmail}
Travel Dates: ${data.preferredTravelDate || 'Flexible'}

Thank you for contacting SMELTRAVELS876. A travel ambassador is reviewing your inquiry and will reach out via ${data.preferredContactMethod || 'WhatsApp'} within 24 hours.

Visit: ${BRAND.website}
      `.trim();

      return {
        subject,
        html: wrapEmailTemplate({
          title: subject,
          preheader,
          bodyHtml,
          senderBadge: 'bookings@smeltravels876.com',
        }),
        text,
        defaultSender,
      };
    }

    // 2. Admin Alert: Customer Enquiry
    case 'inquiry_admin': {
      const tripName = data.tripName || 'General Inquiry';
      const subject = `[ADMIN ALERT] New Customer Inquiry: ${tripName} — ${customerName} (#${ref})`;
      const preheader = `New inquiry received from ${customerName} (${customerEmail}) for ${tripName}.`;
      const defaultSender = RESEND_SENDERS.BOOKINGS;

      const bodyHtml = `
        <div style="display: inline-block; background-color: #FEF3C7; color: #92400E; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
          Urgent Staff Notification • Ref #${ref}
        </div>
        <h2 style="margin: 0 0 10px 0; font-size: 20px; color: ${BRAND.primaryColor}; font-weight: 800;">
          New Traveler Inquiry Received
        </h2>
        <p style="font-size: 13px; color: #64748B; margin: 0 0 16px 0;">
          A customer has submitted a trip inquiry. Please review details below and follow up via WhatsApp or email.
        </p>

        <div class="card">
          <table class="table-details">
            <tr><td>Customer:</td><td>${customerName}</td></tr>
            <tr><td>Email:</td><td><a href="mailto:${customerEmail}" style="color: #2563EB;">${customerEmail}</a></td></tr>
            <tr><td>Phone / WhatsApp:</td><td><a href="https://wa.me/${(data.phone || '').replace(/[^0-9]/g, '')}" style="color: #059669; font-weight: 800;">${data.phone || 'N/A'}</a></td></tr>
            <tr><td>Location:</td><td>${data.countryOrParish || 'Jamaica'}</td></tr>
            <tr><td>Trip / Tour:</td><td>${tripName}</td></tr>
            <tr><td>Dates:</td><td>${data.preferredTravelDate || 'Flexible'}</td></tr>
            <tr><td>Travelers:</td><td>${data.adultsCount || 1} Adult(s)</td></tr>
            <tr><td>Preferred Contact:</td><td style="text-transform: capitalize;">${data.preferredContactMethod || 'WhatsApp'}</td></tr>
          </table>
        </div>

        ${data.specialRequests ? `
        <div style="background: #F1F5F9; border-left: 4px solid ${BRAND.primaryColor}; padding: 14px; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-size: 11px; font-weight: bold; color: #64748B; text-transform: uppercase;">Customer's Inquiry Message:</div>
          <div style="font-size: 13px; color: #1E293B; margin-top: 4px; line-height: 1.5;">"${data.specialRequests}"</div>
        </div>
        ` : ''}

        <div style="text-align: center;">
          <a href="${BRAND.website}" class="btn">Open Admin Dashboard &rarr;</a>
        </div>
      `;

      const text = `
[ADMIN ALERT] NEW TRAVELER INQUIRY
Ref: #${ref}
Customer: ${customerName} (${customerEmail})
Phone: ${data.phone || 'N/A'}
Trip: ${tripName}
Dates: ${data.preferredTravelDate || 'Flexible'}
Message: ${data.specialRequests || 'None'}
      `.trim();

      return {
        subject,
        html: wrapEmailTemplate({
          title: subject,
          preheader,
          bodyHtml,
          senderBadge: 'bookings@smeltravels876.com',
        }),
        text,
        defaultSender,
      };
    }

    // 3. Customer Booking Request & Deposit Confirmation
    case 'booking_customer': {
      const tripName = data.tripName || data.tripTitle || 'Exclusive Travel Package';
      const depositPaid = Number(data.depositPaid || data.deposit || 0);
      const totalPrice = Number(data.totalPrice || 0);
      const remainingBalance = Math.max(0, totalPrice - depositPaid);
      const subject = `Booking Confirmed: ${tripName} (Ref: #${ref}) — SMELTRAVELS876`;
      const preheader = `Your reservation #${ref} for ${tripName} is officially recorded with SMELTRAVELS876.`;
      const defaultSender = RESEND_SENDERS.BOOKINGS;

      const bodyHtml = `
        <div style="display: inline-block; background-color: #DCFCE7; color: #15803D; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
          Confirmed Reservation • Ref #${ref}
        </div>
        <h2 style="margin: 0 0 10px 0; font-size: 22px; color: ${BRAND.primaryColor}; font-weight: 800;">
          Pack Your Bags, ${customerName}!
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: ${BRAND.textDark}; margin: 0 0 16px 0;">
          Your reservation request for <strong>${tripName}</strong> has been received and confirmed. Review your booking summary and payment status below.
        </p>

        <div class="card">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748B; margin-bottom: 8px;">
            Booking & Itinerary Details
          </div>
          <table class="table-details">
            <tr><td>Booking Reference:</td><td><span style="font-family: monospace; background: #E2E8F0; padding: 2px 8px; border-radius: 6px;">#${ref}</span></td></tr>
            <tr><td>Travel Package:</td><td>${tripName}</td></tr>
            <tr><td>Travel Dates:</td><td>${data.preferredTravelDate || data.travelDates || 'Confirmed on Voucher'}</td></tr>
            <tr><td>Travelers:</td><td>${data.adultsCount || 1} Adult(s)${data.childrenCount ? `, ${data.childrenCount} Children` : ''}</td></tr>
            <tr><td>Total Package:</td><td>$${totalPrice.toLocaleString()} JMD</td></tr>
            <tr><td>Deposit Received:</td><td style="color: #16A34A; font-weight: 800;">$${depositPaid.toLocaleString()} JMD</td></tr>
            <tr><td>Remaining Balance:</td><td style="color: #D97706; font-weight: 800;">$${remainingBalance.toLocaleString()} JMD</td></tr>
            ${data.ambassadorName ? `<tr><td>Assigned Ambassador:</td><td>${data.ambassadorName}</td></tr>` : ''}
            ${data.paymentMethod ? `<tr><td>Payment Method:</td><td>${data.paymentMethod}</td></tr>` : ''}
          </table>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; color: ${BRAND.primaryColor}; font-size: 13px; font-weight: 800;">NCB Jamaica Bank Details for Balances & Installments</h4>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569;">
            Bank Name: <strong>National Commercial Bank (NCB) Jamaica</strong><br/>
            Account Name: <strong>SMELTRAVELS876 LIMITED</strong><br/>
            Account Number: <strong>354-928-1029</strong> (Chequing / Business)<br/>
            Branch: <strong>Kingston Central</strong>
          </p>
          <p style="margin: 0; font-size: 11px; color: #64748B;">
            *Please include your booking reference <strong>#${ref}</strong> in the bank transfer memo.
          </p>
        </div>

        <div style="text-align: center;">
          <a href="${BRAND.website}" class="btn">View Booking Details in Portal &rarr;</a>
        </div>
      `;

      const text = `
SMELTRAVELS876 - BOOKING CONFIRMATION
Ref: #${ref}
Customer: ${customerName}
Trip: ${tripName}
Dates: ${data.preferredTravelDate || 'Confirmed'}
Total: $${totalPrice.toLocaleString()} JMD
Deposit Paid: $${depositPaid.toLocaleString()} JMD
Remaining Balance: $${remainingBalance.toLocaleString()} JMD

NCB Bank Account: 354-928-1029 (SMELTRAVELS876 LIMITED)
Memo: Ref #${ref}

Thank you for choosing SMELTRAVELS876!
      `.trim();

      return {
        subject,
        html: wrapEmailTemplate({
          title: subject,
          preheader,
          bodyHtml,
          senderBadge: 'bookings@smeltravels876.com',
        }),
        text,
        defaultSender,
      };
    }

    // 4. Admin Alert: New Booking or Deposit
    case 'booking_admin': {
      const tripName = data.tripName || data.tripTitle || 'Travel Package';
      const depositPaid = Number(data.depositPaid || data.deposit || 0);
      const totalPrice = Number(data.totalPrice || 0);
      const subject = `[ADMIN ALERT] New Booking / Deposit: ${tripName} — ${customerName} ($${depositPaid.toLocaleString()} JMD)`;
      const preheader = `New booking #${ref} received from ${customerName}. Deposit: $${depositPaid.toLocaleString()} JMD.`;
      const defaultSender = RESEND_SENDERS.BOOKINGS;

      const bodyHtml = `
        <div style="display: inline-block; background-color: #DCFCE7; color: #166534; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
          Live Booking Notification • Ref #${ref}
        </div>
        <h2 style="margin: 0 0 10px 0; font-size: 20px; color: ${BRAND.primaryColor}; font-weight: 800;">
          New Booking &amp; Payment Recorded
        </h2>
        <p style="font-size: 13px; color: #64748B; margin: 0 0 16px 0;">
          Traveler <strong>${customerName}</strong> has completed a booking for <strong>${tripName}</strong>.
        </p>

        <div class="card">
          <table class="table-details">
            <tr><td>Reference:</td><td><strong style="font-family: monospace;">#${ref}</strong></td></tr>
            <tr><td>Customer:</td><td>${customerName}</td></tr>
            <tr><td>Email:</td><td><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
            <tr><td>Phone / WhatsApp:</td><td><a href="https://wa.me/${(data.phone || '').replace(/[^0-9]/g, '')}">${data.phone || 'N/A'}</a></td></tr>
            <tr><td>Parish / Country:</td><td>${data.countryOrParish || 'Jamaica'}</td></tr>
            <tr><td>Trip / Package:</td><td>${tripName}</td></tr>
            <tr><td>Deposit Paid:</td><td style="color: #16A34A; font-weight: 800;">$${depositPaid.toLocaleString()} JMD</td></tr>
            <tr><td>Total Price:</td><td>$${totalPrice.toLocaleString()} JMD</td></tr>
            ${data.transactionId ? `<tr><td>Transaction ID:</td><td>${data.transactionId}</td></tr>` : ''}
            ${data.paymentMethod ? `<tr><td>Payment Method:</td><td>${data.paymentMethod}</td></tr>` : ''}
            ${data.ambassadorName ? `<tr><td>Assigned Ambassador:</td><td>${data.ambassadorName}</td></tr>` : ''}
          </table>
        </div>

        <div style="text-align: center;">
          <a href="${BRAND.website}" class="btn">Open Master Excel Database &rarr;</a>
        </div>
      `;

      const text = `
[ADMIN ALERT] NEW BOOKING / DEPOSIT
Ref: #${ref}
Customer: ${customerName} (${customerEmail})
Phone: ${data.phone || 'N/A'}
Trip: ${tripName}
Deposit Paid: $${depositPaid.toLocaleString()} JMD
Total Price: $${totalPrice.toLocaleString()} JMD
Transaction ID: ${data.transactionId || 'N/A'}
      `.trim();

      return {
        subject,
        html: wrapEmailTemplate({
          title: subject,
          preheader,
          bodyHtml,
          senderBadge: 'bookings@smeltravels876.com',
        }),
        text,
        defaultSender,
      };
    }

    // 5. Customer Custom Trip Request
    case 'custom_trip_customer': {
      const destination = data.destination || 'Custom Journey';
      const subject = `Custom Trip Request Received: ${destination} (Ref: #${ref}) — SMELTRAVELS876`;
      const preheader = `We received your custom itinerary request #${ref} for ${destination}.`;
      const defaultSender = RESEND_SENDERS.BOOKINGS;

      const bodyHtml = `
        <div style="display: inline-block; background-color: #FEF3C7; color: #92400E; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
          Custom Itinerary Request • Ref #${ref}
        </div>
        <h2 style="margin: 0 0 10px 0; font-size: 22px; color: ${BRAND.primaryColor}; font-weight: 800;">
          Dream Trip Received, ${customerName}!
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: ${BRAND.textDark}; margin: 0 0 16px 0;">
          Thank you for trusting SMELTRAVELS876 to design your personalized itinerary to <strong>${destination}</strong>. Our senior itinerary planners are preparing flight routes and hotel options.
        </p>

        <div class="card">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748B; margin-bottom: 8px;">
            Requested Specifications
          </div>
          <table class="table-details">
            <tr><td>Reference:</td><td>#${ref}</td></tr>
            <tr><td>Destination:</td><td>${destination} (${data.country || destination})</td></tr>
            <tr><td>Travel Dates:</td><td>${data.travelDatesSummary || data.startDate || 'Flexible'}</td></tr>
            <tr><td>Duration:</td><td>${data.durationSummary || (data.durationDays ? `${data.durationDays} Days` : 'Flexible')}</td></tr>
            <tr><td>Travelers:</td><td>${data.travelersCount || `${data.adultsCount || 1} Adult(s)`}</td></tr>
            <tr><td>Vibe & Style:</td><td>${data.tripVibe || 'Vacation'} • ${data.travelStyle || 'Comfortable'}</td></tr>
            <tr><td>Budget Preference:</td><td>${data.budgetPerPerson || 'Standard / Flexible'}</td></tr>
          </table>
        </div>

        <div style="text-align: center;">
          <a href="${BRAND.website}" class="btn">View Website Concierge &rarr;</a>
        </div>
      `;

      const text = `
SMELTRAVELS876 - CUSTOM TRIP REQUEST RECEIVED
Ref: #${ref}
Customer: ${customerName}
Destination: ${destination}
Travel Dates: ${data.travelDatesSummary || 'Flexible'}
Travelers: ${data.travelersCount || '1'}

Our itinerary team is tailoring your proposal.
      `.trim();

      return {
        subject,
        html: wrapEmailTemplate({
          title: subject,
          preheader,
          bodyHtml,
          senderBadge: 'bookings@smeltravels876.com',
        }),
        text,
        defaultSender,
      };
    }

    // 6. Admin Alert: Custom Trip Request
    case 'custom_trip_admin': {
      const destination = data.destination || 'Custom Journey';
      const subject = `[ADMIN ALERT] New Custom Trip Request: ${destination} — ${customerName} (#${ref})`;
      const preheader = `Custom itinerary request for ${destination} from ${customerName}.`;
      const defaultSender = RESEND_SENDERS.BOOKINGS;

      const bodyHtml = `
        <div style="display: inline-block; background-color: #EDE9FE; color: #5B21B6; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
          Custom Trip Alert • Ref #${ref}
        </div>
        <h2 style="margin: 0 0 10px 0; font-size: 20px; color: ${BRAND.primaryColor}; font-weight: 800;">
          New Custom Itinerary Request
        </h2>
        <p style="font-size: 13px; color: #64748B; margin: 0 0 16px 0;">
          A customer has designed a custom trip proposal. Review specifications below:
        </p>

        <div class="card">
          <table class="table-details">
            <tr><td>Reference:</td><td><strong>#${ref}</strong></td></tr>
            <tr><td>Customer:</td><td>${customerName}</td></tr>
            <tr><td>Email:</td><td><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
            <tr><td>Phone / WhatsApp:</td><td><a href="https://wa.me/${(data.phone || '').replace(/[^0-9]/g, '')}">${data.phone || 'N/A'}</a></td></tr>
            <tr><td>Destination:</td><td>${destination} (${data.country || destination})</td></tr>
            <tr><td>Travel Dates:</td><td>${data.travelDatesSummary || 'Flexible'}</td></tr>
            <tr><td>Party Size:</td><td>${data.travelersCount || '1 Adult'}</td></tr>
            <tr><td>Travel Style:</td><td>${data.travelStyle || 'Comfortable'}</td></tr>
            <tr><td>Trip Vibe:</td><td>${data.tripVibe || 'Vacation'}</td></tr>
            <tr><td>Budget:</td><td>${data.budgetPerPerson || 'Flexible'}</td></tr>
          </table>
        </div>

        ${data.specialRequests ? `
        <div style="background: #FFFBEB; border: 1px solid #FCD34D; padding: 14px; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-size: 11px; font-weight: bold; color: #92400E; text-transform: uppercase;">Traveler's Dream Notes:</div>
          <div style="font-size: 13px; color: #78350F; margin-top: 4px; line-height: 1.5;">"${data.specialRequests}"</div>
        </div>
        ` : ''}

        <div style="text-align: center;">
          <a href="${BRAND.website}" class="btn">Configure in Admin Portal &rarr;</a>
        </div>
      `;

      const text = `
[ADMIN ALERT] CUSTOM TRIP REQUEST
Ref: #${ref}
Customer: ${customerName} (${customerEmail})
Destination: ${destination}
Dates: ${data.travelDatesSummary || 'Flexible'}
Party: ${data.travelersCount || '1 Adult'}
Notes: ${data.specialRequests || 'None'}
      `.trim();

      return {
        subject,
        html: wrapEmailTemplate({
          title: subject,
          preheader,
          bodyHtml,
          senderBadge: 'bookings@smeltravels876.com',
        }),
        text,
        defaultSender,
      };
    }

    // 7. Customer Account Registration
    case 'welcome_account': {
      const subject = `Welcome to SMELTRAVELS876 — Your VIP Traveler Account is Ready`;
      const preheader = `Welcome ${customerName}! Your SMELTRAVELS876 portal access is confirmed.`;
      const defaultSender = RESEND_SENDERS.NOTIFICATIONS;

      const bodyHtml = `
        <div style="display: inline-block; background-color: #EDE9FE; color: #5B21B6; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
          Account Security & Access
        </div>
        <h2 style="margin: 0 0 10px 0; font-size: 22px; color: ${BRAND.primaryColor}; font-weight: 800;">
          Welcome to the SMEL Family, ${customerName}!
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: ${BRAND.textDark}; margin: 0 0 16px 0;">
          Your traveler account with <strong>SMELTRAVELS876</strong> has been registered. You can now track your booking inquiries, manage payment installment schedules, and save upcoming dream destinations.
        </p>

        <div class="card">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748B; margin-bottom: 8px;">
            Account Credentials
          </div>
          <table class="table-details">
            <tr><td>Registered Name:</td><td>${customerName}</td></tr>
            <tr><td>Email:</td><td>${customerEmail}</td></tr>
            <tr><td>Member Since:</td><td>${new Date().getFullYear()}</td></tr>
            <tr><td>Status:</td><td><span style="color: #16A34A; font-weight: 800;">Active Traveler</span></td></tr>
          </table>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; color: ${BRAND.primaryColor}; font-size: 13px; font-weight: 800;">Your VIP Traveler Privileges</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #475569; line-height: 1.7;">
            <li>Early access to 2026/2027 group trip launches (Panama, Antigua, Colombia, Greece).</li>
            <li>Real-time tracking of bookings, deposits, and payment milestone reminders.</li>
            <li>Direct concierge link with assigned executive travel ambassadors.</li>
          </ul>
        </div>

        <div style="text-align: center;">
          <a href="${BRAND.website}" class="btn">Explore Upcoming Group Trips &rarr;</a>
        </div>
      `;

      const text = `
Welcome to SMELTRAVELS876, ${customerName}!
Your traveler account (${customerEmail}) is ready.
Track inquiries, view bookings, and explore upcoming group packages at ${BRAND.website}.
      `.trim();

      return {
        subject,
        html: wrapEmailTemplate({
          title: subject,
          preheader,
          bodyHtml,
          senderBadge: 'notifications@smeltravels876.com',
        }),
        text,
        defaultSender,
      };
    }

    // 8. Sign-in Security Alert
    case 'security_alert': {
      const loginTime = data.time || new Date().toLocaleString('en-US', { timeZone: 'America/Jamaica' });
      const ipOrDevice = data.device || 'Web Browser (SSL Encrypted)';
      const subject = `Security Alert: New Sign-in to Your SMELTRAVELS876 Account`;
      const preheader = `New login detected for ${customerEmail} on ${loginTime}.`;
      const defaultSender = RESEND_SENDERS.NOTIFICATIONS;

      const bodyHtml = `
        <div style="display: inline-block; background-color: #FEF3C7; color: #92400E; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
          Account Security Notification
        </div>
        <h2 style="margin: 0 0 10px 0; font-size: 20px; color: ${BRAND.primaryColor}; font-weight: 800;">
          New Sign-in Detected
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: ${BRAND.textDark}; margin: 0 0 16px 0;">
          Hello ${customerName}, we detected a successful sign-in to your SMELTRAVELS876 account on <strong>${loginTime} (Jamaica Time)</strong>.
        </p>

        <div class="card">
          <table class="table-details">
            <tr><td>Account:</td><td>${customerEmail}</td></tr>
            <tr><td>Time &amp; Date:</td><td>${loginTime}</td></tr>
            <tr><td>Device / Client:</td><td>${ipOrDevice}</td></tr>
            <tr><td>Portal:</td><td>SMELTRAVELS876 Web Application</td></tr>
          </table>
        </div>

        <p style="font-size: 12px; color: #64748B; line-height: 1.5;">
          If this was you, no action is needed. If you did not sign in at this time, please contact our security team immediately via WhatsApp at <a href="https://wa.me/${BRAND.whatsapp}" style="color: #2563EB;">${BRAND.phone}</a> or reply to this notification.
        </p>
      `;

      const text = `
SECURITY ALERT: New Sign-in Detected
Account: ${customerEmail}
Time: ${loginTime}
Device: ${ipOrDevice}

If this was not you, contact SMELTRAVELS876 security immediately at ${BRAND.phone}.
      `.trim();

      return {
        subject,
        html: wrapEmailTemplate({
          title: subject,
          preheader,
          bodyHtml,
          senderBadge: 'notifications@smeltravels876.com',
        }),
        text,
        defaultSender,
      };
    }

    // 9. Admin Test Email
    case 'test_email':
    default: {
      const senderChoice = data.senderChoice || 'bookings';
      const senderDisplay = senderChoice === 'notifications' ? RESEND_SENDERS.NOTIFICATIONS : RESEND_SENDERS.BOOKINGS;
      const testSubject = data.customSubject || `Resend Integration Test (${senderChoice}@smeltravels876.com) — ${new Date().toLocaleTimeString()}`;
      const subject = testSubject;
      const preheader = `Live test email dispatched from verified domain smeltravels876.com via Resend.`;
      const defaultSender = senderDisplay;

      const bodyHtml = `
        <div style="display: inline-block; background-color: #DCFCE7; color: #166534; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
          Resend Diagnostic Test • OK
        </div>
        <h2 style="margin: 0 0 10px 0; font-size: 20px; color: ${BRAND.primaryColor}; font-weight: 800;">
          Resend API Integration Test
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: ${BRAND.textDark}; margin: 0 0 16px 0;">
          This is an official test email verifying that <strong>${senderDisplay}</strong> is operational and properly configured with Resend API credentials on the server.
        </p>

        <div class="card">
          <table class="table-details">
            <tr><td>Sender Address:</td><td>${senderDisplay}</td></tr>
            <tr><td>Target Recipient:</td><td>${customerEmail || (Array.isArray(data.to) ? data.to.join(', ') : data.to)}</td></tr>
            <tr><td>Verified Domain:</td><td>smeltravels876.com</td></tr>
            <tr><td>Dispatched At:</td><td>${new Date().toISOString()}</td></tr>
            <tr><td>Environment:</td><td>${process.env.NODE_ENV || 'development'}</td></tr>
          </table>
        </div>

        <div style="background: #F1F5F9; border-radius: 12px; padding: 14px; font-size: 12px; color: #475569;">
          <strong>Message Note:</strong> ${data.message || 'Domain smeltravels876.com successfully verified in Resend. Transactional emails are operational.'}
        </div>
      `;

      const text = `
SMELTRAVELS876 RESEND INTEGRATION TEST
Sender: ${senderDisplay}
Status: Verified & Operational
Timestamp: ${new Date().toISOString()}
      `.trim();

      return {
        subject,
        html: wrapEmailTemplate({
          title: subject,
          preheader,
          bodyHtml,
          senderBadge: senderChoice === 'notifications' ? 'notifications@smeltravels876.com' : 'bookings@smeltravels876.com',
        }),
        text,
        defaultSender,
      };
    }
  }
}

// Dispatch function via official Resend API
export async function sendResendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  status: 'Delivered' | 'Queued' | 'Simulated' | 'Failed';
  error?: string;
  htmlContent: string;
  subject: string;
  sender: string;
}> {
  const rendered = renderEmailTemplate(options.type, options.data);
  const sender = options.sender || rendered.defaultSender;
  const subject = options.subject || rendered.subject;
  const recipients = Array.isArray(options.to) ? options.to : [options.to];

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.log(`[Resend Engine] RESEND_API_KEY not configured. Simulated delivery for ${recipients.join(', ')} from ${sender}`);
    return {
      success: true,
      messageId: `simulated-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      status: 'Simulated',
      htmlContent: rendered.html,
      subject,
      sender,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: sender,
      to: recipients,
      replyTo: options.replyTo || (sender.includes('notifications') ? 'notifications@smeltravels876.com' : 'bookings@smeltravels876.com'),
      subject,
      html: rendered.html,
      text: rendered.text,
    });

    if (error) {
      const errorMsg = typeof error === 'string'
        ? error
        : (error.message || (error as any).name || 'Resend API provider rejected the request');
      console.error(`[Resend Provider Notice]: Failed to dispatch to ${recipients.join(', ')} - ${errorMsg}`);
      return {
        success: false,
        status: 'Failed',
        error: errorMsg,
        htmlContent: rendered.html,
        subject,
        sender,
      };
    }

    console.log(`[Resend Engine] Live email dispatched! ID: ${data?.id} to ${recipients.join(', ')}`);
    return {
      success: true,
      messageId: data?.id,
      status: 'Delivered',
      htmlContent: rendered.html,
      subject,
      sender,
    };
  } catch (err: any) {
    const errorMsg = err?.message || 'Unknown Resend dispatch failure';
    console.error(`[Resend Engine Exception]: ${errorMsg}`);
    return {
      success: false,
      status: 'Failed',
      error: errorMsg,
      htmlContent: rendered.html,
      subject,
      sender,
    };
  }
}
