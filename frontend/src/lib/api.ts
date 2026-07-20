// Thin client for the Flask backend.
// - Sends cookies (credentials: 'include') for JWT httpOnly auth.
// - Adds the X-CSRF-TOKEN header (from the non-httpOnly csrf cookie) on
//   state-changing requests, as required by Flask-JWT-Extended.
// - Silently refreshes the access token once on 401, then retries.

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

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
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

  const res = await fetch(`${API_BASE}${path}`, {
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

  // Access token expired → refresh once, then retry the original request.
  if (
    res.status === 401 &&
    !options._retried &&
    !path.startsWith('/api/auth/login') &&
    !path.startsWith('/api/auth/register') &&
    !path.startsWith('/api/auth/refresh') &&
    !path.startsWith('/api/auth/forgot-password') &&
    !path.startsWith('/api/auth/reset-password')
  ) {
    const ok = await tryRefresh();
    if (ok) return request<T>(path, { ...options, _retried: true });
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data && (data as { error: string }).error) ||
      `Kérés sikertelen (${res.status})`;
    throw new ApiError(message as string, res.status, data);
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
  patch: <T = unknown>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  del: <T = unknown>(path: string) => request<T>(path, { method: 'DELETE' }),
};
