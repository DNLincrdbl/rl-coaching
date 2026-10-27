'use client';

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      className="rlm-card p-4 border-red-500/20 bg-red-500/5 flex flex-col sm:flex-row sm:items-center gap-3"
      role="alert"
    >
      <p className="text-sm text-red-300 flex-1">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="rlm-btn-primary px-4 py-2 text-sm shrink-0">
          Újrapróbálás
        </button>
      )}
    </div>
  );
}

export default function PageError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-gray-300 mb-4 max-w-md">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="rlm-btn-primary px-5 py-2.5">
          Újrapróbálás
        </button>
      )}
    </div>
  );
}
