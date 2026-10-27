'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { TOAST_EVENT, type ToastDetail, type ToastKind } from '@/lib/toast';

type ToastItem = ToastDetail & { id: number };

const KIND_UI: Record<ToastKind, { wrap: string; icon: React.ReactNode }> = {
  error: {
    wrap: 'border-red-500/30 bg-[#14080a]',
    icon: <FaExclamationCircle className="w-4 h-4 text-red-400 shrink-0" />,
  },
  success: {
    wrap: 'border-emerald-500/30 bg-[#07140e]',
    icon: <FaCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />,
  },
  info: {
    wrap: 'border-orange-500/30 bg-[#140e08]',
    icon: <FaInfoCircle className="w-4 h-4 text-orange-400 shrink-0" />,
  },
};

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      if (!detail?.message) return;
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-3), { id, ...detail }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5200);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[400] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const ui = KIND_UI[toast.kind];
          return (
            <motion.div
              key={toast.id}
              role="status"
              initial={{ opacity: 0, y: -8, x: 12 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-3.5 py-3 shadow-2xl ${ui.wrap}`}
            >
              {ui.icon}
              <p className="flex-1 text-sm text-gray-200 leading-snug">{toast.message}</p>
              <button
                type="button"
                aria-label="Bezárás"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="p-0.5 rounded text-gray-500 hover:text-white"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
