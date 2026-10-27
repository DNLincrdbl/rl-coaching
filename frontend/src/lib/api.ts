// Thin client for the Flask backend.
// - Sends cookies (credentials: 'include') for JWT httpOnly auth.
// - Adds the X-CSRF-TOKEN header (from the non-httpOnly csrf cookie) on
//   state-changing requests, as required by Flask-JWT-Extended.
// - Silently refreshes the access token once on 401, then retries.

import { AUTH_EXPIRED_EVENT } from './toast';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5001';

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const SKIP_REFRESH = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/confirm-email',
];

const STATUS_MESSAGES: Record<number, string> = {
  0: 'A szerver nem elérhető. Ellenőrizd a kapcsolatot.',
  400: 'Érvénytelen kérés.',
  401: 'A belépésed lejárt. Jelentkezz be újra.',
  403: 'Nincs jogosultságod ehhez.',
  404: 'Nem található.',
  405: 'Ez a művelet nem támogatott.',
  409: 'Ez a művelet ütközik egy meglévő állapottal.',
  413: 'A fájl túl nagy.',
  415: 'Nem támogatott fájltípus.',
  429: 'Túl sok kérés. Várj egy kicsit, majd próbáld újra.',
  500: 'Valami elromlott a szerveren. Próbáld újra később.',
  502: 'A szerver nem elérhető.',
  503: 'A szerver átmenetileg nem elérhető.',
};

const ENGLISH_ERRORS: Record<string, string> = {
  'Not found': STATUS_MESSAGES[404],
  Unauthorized: STATUS_MESSAGES[401],
  Forbidden: STATUS_MESSAGES[403],
  'Internal server error': STATUS_MESSAGES[500],
  'Too many requests, please slow down.': STATUS_MESSAGES[429],
  'Missing or invalid credentials': STATUS_MESSAGES[401],
  'Invalid token': STATUS_MESSAGES[401],
  'Token expired': STATUS_MESSAGES[401],
};

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function hasSessionCookies(): boolean {
  return Boolean(getCookie('csrf_access_token') || getCookie('csrf_refresh_token'));
}

function messageFromBody(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const rec = data as Record<string, unknown>;
  const raw = rec.error ?? rec.msg ?? rec.message;
  if (typeof raw !== 'string') return null;
  const text = raw.trim();
  if (!text || text.startsWith('<')) return null;
  return ENGLISH_ERRORS[text] || text;
}

function friendlyMessage(status: number, data: unknown): string {
  return messageFromBody(data) || STATUS_MESSAGES[status] || `Kérés sikertelen (${status})`;
}

type Options = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  /** Internal: skip the automatic refresh+retry on 401. */
  _retried?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  // Deduplicate concurrent refresh attempts.
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const csrf = getCookie('csrf_refresh_token') || getCookie('csrf_access_token');
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: csrf ? { 'X-CSRF-TOKEN': csrf } : {},
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

function notifyAuthExpired() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

async function request<T = unknown>(path: string, options: Options = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = { ...(options.headers || {}) };

  const isForm = options.body instanceof FormData;
  // Let the browser set the multipart boundary for FormData bodies.
  if (options.body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  if (!['GET', 'HEAD'].includes(method)) {
    const csrf = getCookie('csrf_access_token');
    if (csrf) headers['X-CSRF-TOKEN'] = csrf;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      credentials: 'include',
      body:
        options.body === undefined
          ? undefined
          : isForm
            ? (options.body as FormData)
            : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(STATUS_MESSAGES[0], 0, null);
  }

  // Access token expired → refresh once, then retry the original request.
  const skipRefresh = SKIP_REFRESH.some((p) => path.startsWith(p));
  if (res.status === 401 && !options._retried && !skipRefresh) {
    const hadSession = hasSessionCookies();
    const ok = await tryRefresh();
    if (ok) return request<T>(path, { ...options, _retried: true });
    if (hadSession) notifyAuthExpired();
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(friendlyMessage(res.status, data), res.status, data);
  }
  return data as T;
}

/**
 * Turn a backend-relative media path (e.g. "/api/coaching/videos/x.mp4") into an
 * absolute URL against the API host. Absolute/blob/data URLs are returned as-is.
 */
export function resolveVideoUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  // Backend-served uploads live under /api/... -> resolve against the API host.
  if (url.startsWith('/api/')) return `${API_BASE}${url}`;
  // Everything else (e.g. /sample-replay.mp4) is a same-origin public asset.
  return url;
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path),
  post: <T = unknown>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  postForm: <T = unknown>(path: string, form: FormData) => request<T>(path, { method: 'POST', body: form }),
  put: <T = unknown>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T = unknown>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  del: <T = unknown>(path: string) => request<T>(path, { method: 'DELETE' }),
};
