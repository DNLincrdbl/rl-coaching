'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBug, FaTimes } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { useRLM } from '@/contexts/RLMContext';

export default function ReportIssueButton() {
  const { reportIssue } = useRLM();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const submit = async () => {
    if (message.trim().length < 8) return;
    setBusy(true);
    setError(null);
    try {
      await reportIssue(message.trim(), pathname);
      setDone(true);
      setMessage('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nem sikerült elküldeni.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setDone(false); setError(null); }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:text-white"
        title="Hibajelentés"
      >
        <FaBug className="w-5 h-5 text-gray-400" />
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.96, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0A0C] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Hibajelentés</h3>
                  <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
                    <FaTimes className="text-gray-400" />
                  </button>
                </div>
                {done ? (
                  <p className="text-green-400 text-sm">Megkaptuk, köszönjük! Zoli látni fogja az admin felületen.</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-400 mb-3">Írd le, mi nem működik. RLM és RLM+ tagok egyaránt küldhetnek jelentést.</p>
                    {error && (
                      <p className="text-sm text-red-400 mb-3" role="alert">{error}</p>
                    )}
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      placeholder="Pl. a replay feltöltés elakad Chrome-ban..."
                      className="w-full mb-4 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                    />
                    <button
                      type="button"
                      onClick={submit}
                      disabled={busy || message.trim().length < 8}
                      className="w-full rlm-btn-primary py-2.5 disabled:opacity-40"
                    >
                      {busy ? 'Küldés...' : 'Küldés'}
                    </button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
