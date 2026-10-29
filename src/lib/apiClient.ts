/**
 * SMELTRAVELS876 Safe API Client
 *
 * Prevents "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" errors
 * by validating response Content-Type and body format before JSON parsing.
 * Provides actionable diagnostics for Hostinger Apache/LiteSpeed fallback responses.
 */

export interface SafeApiResponse<T = any> {
  ok: boolean;
  status: number;
  statusText: string;
  isHtml: boolean;
  contentType: string;
  data: T | null;
  error?: string;
  rawText?: string;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<SafeApiResponse<T>> {
  try {
    const res = await fetch(input, init);
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const text = await res.text();
    const trimmed = text.trim();

    // Check if response is HTML or plaintext error rather than JSON
    const isHtml =
      contentType.includes('text/html') ||
      trimmed.startsWith('<!DOCTYPE') ||
      trimmed.startsWith('<!doctype') ||
      trimmed.startsWith('<html') ||
      trimmed.startsWith('<head');

    if (isHtml) {
      let diagnostic = `Backend returned HTML (HTTP ${res.status} ${res.statusText || ''}) instead of JSON.`;

      if (res.status === 404) {
        diagnostic = `Backend route not reachable (HTTP 404 HTML). On Hostinger, this indicates Apache/LiteSpeed is serving a fallback page instead of forwarding API requests to your Node.js Express server. Verify that your Node.js application is started in hPanel with startup file dist/server.cjs.`;
      } else if (res.status === 502 || res.status === 503 || res.status === 504) {
        diagnostic = `Hostinger Gateway Error (HTTP ${res.status}). The Node.js application process is currently stopped or unreachable by Hostinger's reverse proxy.`;
      } else if (trimmed.includes('Single Page Application') || trimmed.includes('<div id="root">')) {
        diagnostic = `Hostinger served index.html for an API request. Verify that your .htaccess file prevents rewriting /api/ routes to index.html.`;
      }

      console.warn('[SMELTRAVELS876 API Notice]: HTML response received from API', {
        status: res.status,
        url: typeof input === 'string' ? input : (input as any).url,
        preview: trimmed.slice(0, 160),
      });

      return {
        ok: false,
        status: res.status,
        statusText: res.statusText,
        isHtml: true,
        contentType,
        data: null,
        error: diagnostic,
        rawText: trimmed.slice(0, 300),
      };
    }

    // Attempt to parse JSON cleanly
    try {
      const data = trimmed ? (JSON.parse(trimmed) as T) : null;
      const isOk = res.ok && (!(data as any)?.success === false ? false : true);

      return {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        isHtml: false,
        contentType,
        data,
        error: !res.ok ? ((data as any)?.error || `HTTP ${res.status}: Request failed`) : undefined,
      };
    } catch (parseErr: any) {
      return {
        ok: false,
        status: res.status,
        statusText: res.statusText,
        isHtml: false,
        contentType,
        data: null,
        error: `Invalid JSON response from server (HTTP ${res.status}). ${parseErr?.message || ''}`,
        rawText: trimmed.slice(0, 300),
      };
    }
  } catch (netErr: any) {
    console.error('[SMELTRAVELS876 Network Diagnostic]:', netErr);
    return {
      ok: false,
      status: 0,
      statusText: 'Network Error',
      isHtml: false,
      contentType: '',
      data: null,
      error: `Network connection failed: ${netErr?.message || 'Unable to reach the SMELTRAVELS876 server'}.`,
    };
  }
}
