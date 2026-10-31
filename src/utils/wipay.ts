/**
 * WiPay Jamaica Live Payment Gateway Integration
 * Merchant Account & Live API Key Configuration
 */

export const WIPAY_ACCOUNT_NUMBER = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_WIPAY_ACCOUNT_NUMBER) || '';
export const WIPAY_ENDPOINT = 'https://jm.wipayfinancial.com/plugins/payments/request';
export const WIPAY_MASTER_LINK = 'https://jm.wipayfinancial.com/to_me/smeltravels';
export const WIPAY_ME_USERNAME = 'smeltravels';

import { safeFetchJson } from '../lib/apiClient';

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
 * Initiates WiPay Jamaica live payment request through the secure server backend proxy.
 * Server holds the secret API credentials (WIPAY_ACCOUNT_NUMBER and WIPAY_API_KEY) in environment variables.
 * Falls back to verified WiPay Me master checkout link if backend is unreachable.
 */
export async function createWiPayPaymentRequest(
  payload: WiPayPaymentRequestPayload
): Promise<WiPayPaymentResponse> {
  const orderId = payload.orderId || `ST-${Date.now()}`;
  const responseUrl =
    payload.responseUrl ||
    (typeof window !== 'undefined' ? `${window.location.origin}/booking-success` : 'https://smeltravels876.com/booking-success');

  // Request payment session via server-side proxy
  try {
    const proxyRes = await safeFetchJson<any>('/api/wipay/create-payment', {
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

    if (proxyRes.ok && proxyRes.data?.url) {
      return {
        success: true,
        url: proxyRes.data.url,
        transaction_id: proxyRes.data.transaction_id,
        order_id: proxyRes.data.order_id || orderId,
      };
    }

    if (proxyRes.error) {
      console.warn('[WiPay Proxy Notice]:', proxyRes.error);
    }
  } catch (err) {
    console.warn('[WiPay Proxy Exception]:', err);
  }

  // Graceful fallback to verified WiPay Me link (no secret API key exposed to browser)
  const cleanTitle = encodeURIComponent((payload.tripTitle || 'Smeltravels876 Trip Deposit').trim()).replace(/%20/g, '+');
  const fallbackUrl = `${WIPAY_MASTER_LINK}?total=${Math.max(0, Math.round(payload.deposit))}&client_note=${cleanTitle}`;
  return {
    success: true,
    url: fallbackUrl,
    order_id: orderId,
  };
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

export interface WiPayVerificationResult {
  verified: boolean;
  transaction_id?: string;
  order_id?: string;
  amount?: number;
  error?: string;
}

/**
 * Validates with backend that payment for orderId was legitimately processed by WiPay.
 */
export async function verifyWiPayTransactionStatus(
  orderId: string,
  transactionId?: string,
  deposit?: number
): Promise<WiPayVerificationResult> {
  try {
    const res = await fetch('/api/wipay/verify-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        transaction_id: transactionId,
        deposit,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        verified: !!data.verified,
        transaction_id: data.transaction_id,
        order_id: data.order_id,
        amount: data.amount,
      };
    }
    const errData = await res.json().catch(() => ({}));
    return {
      verified: false,
      error: errData.error || 'Verification request failed.',
    };
  } catch (err: any) {
    return {
      verified: false,
      error: err.message || 'Network connection error during verification.',
    };
  }
}
