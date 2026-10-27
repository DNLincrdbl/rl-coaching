'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const EASE = [0.76, 0, 0.24, 1] as const;

type SideDrawerProps = {
  open: boolean;
  onClose: () => void;
  z?: number;
  title: string;
  children: ReactNode;
};

export default function SideDrawer({ open, onClose, z = 210, title, children }: SideDrawerProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70"
            style={{ zIndex: z }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.55, ease: EASE }}
            className="fixed bottom-0 right-0 top-0 flex w-full max-w-md flex-col bg-black text-white shadow-2xl"
            style={{ zIndex: z + 1 }}
          >
            <div className="flex items-end justify-between border-b border-white/15 px-5 py-5">
              <h2 id={titleId} className="text-4xl font-black tracking-[-0.045em]">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/20 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white/70 transition hover:border-white hover:text-white"
              >
                Bezár
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
