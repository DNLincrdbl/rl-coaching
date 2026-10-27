export const AUTH_EXPIRED_EVENT = 'rlm-auth-expired';
export const TOAST_EVENT = 'rlm-toast';

export type ToastKind = 'error' | 'success' | 'info';

export type ToastDetail = {
  message: string;
  kind: ToastKind;
};

export function showToast(message: string, kind: ToastKind = 'error') {
  if (typeof window === 'undefined') return;
  const text = message.trim();
  if (!text) return;
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { message: text, kind } }));
}

export function errorMessage(e: unknown, fallback = 'Valami elromlott. Próbáld újra.') {
  if (e instanceof Error && e.message.trim()) return e.message;
  return fallback;
}
