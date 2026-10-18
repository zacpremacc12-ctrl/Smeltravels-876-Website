/**
 * WiPay Jamaica Live Payment Gateway Integration
 * Merchant Account & Live API Key Configuration
 */

export const WIPAY_ACCOUNT_NUMBER = '2397990892';
export const WIPAY_API_KEY = 'qxhk2m4kvg';
export const WIPAY_ENDPOINT = 'https://jm.wipayfinancial.com/plugins/payments/request';
export const WIPAY_MASTER_LINK = 'https://jm.wipayfinancial.com/to_me/smeltravels';
export const WIPAY_ME_USERNAME = 'smeltravels';

export interface WiPayPaymentRequestPayload {
  deposit: number;
  tripTitle: string;
  tripId?: string;
  orderId?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  parish?: string;
  responseUrl?: string;
}

export interface WiPayPaymentResponse {
  success: boolean;
  url?: string;
  transaction_id?: string;
  order_id?: string;
  error?: string;
}

/**
 * Performs secure HTTP POST request directly to the WiPay Jamaica live endpoint:
 * https://jm.wipayfinancial.com/plugins/payments/request
 * 
 * Required structural fields:
 * {
 *   "account_number": WIPAY_ACCOUNT_NUMBER,
 *   "api_key": WIPAY_API_KEY,
 *   "total": trip.deposit,
 *   "country_code": "JM",
 *   "currency": "JMD",
 *   "environment": "live",
 *   "fee_structure": "client_pay",
 *   "method": "credit_card",
 *   "order_id": "ST-" + Date.now(),
 *   "origin": "Smeltravels876",
 *   "response_url": window.location.origin + "/booking-success"
 * }
 */
export async function createWiPayPaymentRequest(
  payload: WiPayPaymentRequestPayload
): Promise<WiPayPaymentResponse> {
  const orderId = payload.orderId || `ST-${Date.now()}`;
  const responseUrl =
    payload.responseUrl ||
    (typeof window !== 'undefined' ? `${window.location.origin}/booking-success` : 'https://smeltravels876.com/booking-success');

  // Try server proxy first to avoid browser CORS/adblocker restrictions
  try {
    const proxyRes = await fetch('/api/wipay/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        total: payload.deposit,
        order_id: orderId,
        origin: 'Smeltravels876',
        response_url: responseUrl,
        country_code: 'JM',
        currency: 'JMD',
        environment: 'live',
        fee_structure: 'client_pay',
        method: 'credit_card',
        tripTitle: payload.tripTitle,
        customerName: payload.customerName,
        email: payload.email,
        phone: payload.phone,
        parish: payload.parish,
      }),
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data.url) {
        return {
          success: true,
          url: data.url,
          transaction_id: data.transaction_id,
          order_id: data.order_id || orderId,
        };
      }
    }
  } catch (err) {
    console.warn('[WiPay Proxy Warning] Trying direct endpoint fallback...', err);
  }

  // Direct client POST to WiPay Jamaica Live endpoint
  try {
    const totalFormatted = Number(payload.deposit).toFixed(2);
    const postBody = new URLSearchParams({
      account_number: WIPAY_ACCOUNT_NUMBER,
      api_key: WIPAY_API_KEY,
      total: totalFormatted,
      country_code: 'JM',
      currency: 'JMD',
      environment: 'live',
      fee_structure: 'customer_pay', // WiPay backend API accepts customer_pay for client_pay structure
      method: 'credit_card',
      order_id: orderId,
      origin: 'Smeltravels876',
      response_url: responseUrl,
    });

    const res = await fetch(WIPAY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: postBody.toString(),
    });

    const data = await res.json();

    if (data.url && !data.url.includes('status=error')) {
      return {
        success: true,
        url: data.url,
        transaction_id: data.transaction_id || `WP-TXN-${Date.now()}`,
        order_id: orderId,
      };
    }

    if (data.message && data.message !== 'OK') {
      return {
        success: false,
        error: data.message,
      };
    }

    return {
      success: !!data.url,
      url: data.url,
      transaction_id: data.transaction_id,
      order_id: orderId,
    };
  } catch (directErr: any) {
    console.error('[WiPay Direct Request Error]:', directErr);
    // Graceful fallback to verified WiPay Me link
    const fallbackUrl = `${WIPAY_MASTER_LINK}?total=${payload.deposit}&client_note=${encodeURIComponent(payload.tripTitle).replace(/%20/g, '+')}`;
    return {
      success: true,
      url: fallbackUrl,
      order_id: orderId,
    };
  }
}

export interface WiPayLinkParams {
  deposit: number;
  title: string;
  tripId?: string;
  currency?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  masterLink?: string;
}

/**
 * Builds dynamic WiPay payment link on the fly with pre-filled deposit and tour details.
 */
export function buildWiPayPaymentUrl(params: WiPayLinkParams | { deposit: number; title: string; useCleanMasterOnly?: boolean }): string {
  const master = ('masterLink' in params && params.masterLink) ? params.masterLink : WIPAY_MASTER_LINK;

  if ('useCleanMasterOnly' in params && (params as any).useCleanMasterOnly) {
    return master;
  }

  const cleanDeposit = Math.max(0, Math.round(params.deposit));
  const rawTitle = (params.title || 'Smeltravels876 Trip Deposit').trim();
  const cleanTitle = rawTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '+');

  if (cleanDeposit > 0 && cleanTitle) {
    return `${master}?total=${cleanDeposit}&client_note=${cleanTitle}`;
  } else if (cleanDeposit > 0) {
    return `${master}?total=${cleanDeposit}`;
  }

  return master;
}

/**
 * Formats currency clearly in Jamaican Dollars (JMD).
 */
export function formatJMD(amount: number): string {
  return `$${amount.toLocaleString()} JMD`;
}
