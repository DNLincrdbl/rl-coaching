'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaLock, FaCheckCircle, FaUser, FaSignInAlt, FaCreditCard, FaSyncAlt } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatHuf } from '@/lib/data/products';
import AuthModal from './AuthModal';

type Stage = 'review' | 'processing' | 'success';

export default function CheckoutModal() {
  const { items, subtotal, isCheckoutOpen, closeCheckout, clear } = useCart();
  const { user } = useAuth();
  const [stage, setStage] = useState<Stage>('review');
  const [authOpen, setAuthOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const hasSubscription = items.some((i) => i.type === 'subscription');

  const handleClose = () => {
    closeCheckout();
    setTimeout(() => setStage('review'), 250);
  };

  // Placeholder payment — Stripe Checkout Session comes later.
  const handlePay = () => {
    setStage('processing');
    setTimeout(() => {
      setStage('success');
      clear();
    }, 1400);
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[220]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[230] p-4"
            >
              <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FaLock className="text-orange-400 w-4 h-4" /> Fizetés
                  </h2>
                  <button onClick={handleClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <FaTimes className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {stage === 'success' ? (
                  <div className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4"
                    >
                      <FaCheckCircle className="w-8 h-8 text-green-400" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">Sikeres rendelés!</h3>
                    <p className="text-gray-400 mb-6">
                      Köszönjük a vásárlást. A megrendelés visszaigazolását elküldtük
                      {user?.email ? <> a <span className="text-gray-200">{user.email}</span> címre</> : ''}.
                    </p>
                    <button onClick={handleClose} className="rlm-btn-primary px-6 py-2.5">Bezárás</button>
                  </div>
                ) : (
                  <div className="p-5 space-y-5">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-3">Rendelés összegzése</h3>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">
                              {item.name}
                              {item.type !== 'subscription' && item.qty > 1 ? ` × ${item.qty}` : ''}
                              {item.type === 'subscription' && <span className="text-gray-500"> · előfizetés</span>}
                            </span>
                            <span className="text-white font-medium">{formatHuf(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                        <span className="text-gray-400">Összesen</span>
                        <span className="text-xl font-bold rlm-gradient-text">{formatHuf(subtotal)}</span>
                      </div>
                      {hasSubscription && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                          <FaSyncAlt className="w-3 h-3" /> Az előfizetés havonta automatikusan megújul, bármikor lemondható.
                        </p>
                      )}
                    </div>

                    {!user ? (
                      <div className="rlm-card p-5 text-center">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                          <FaUser className="w-5 h-5 text-orange-400" />
                        </div>
                        <p className="text-white font-medium mb-1">Jelentkezz be a fizetéshez</p>
                        <p className="text-sm text-gray-400 mb-4">
                          A vásárláshoz fiók szükséges, hogy a megrendelésed a profilodhoz kössük.
                        </p>
                        <button
                          onClick={() => setAuthOpen(true)}
                          className="rlm-btn-primary px-5 py-2.5 inline-flex items-center gap-2"
                        >
                          <FaSignInAlt className="w-4 h-4" /> Bejelentkezés / Regisztráció
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="rlm-card p-4">
                          <p className="text-xs text-gray-500 mb-1">Számlázási fiók</p>
                          <p className="text-sm text-white font-medium">{user.displayName}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>

                        <button
                          onClick={handlePay}
                          disabled={stage === 'processing' || items.length === 0}
                          className="w-full rlm-btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {stage === 'processing' ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              Feldolgozás...
                            </>
                          ) : (
                            <>
                              <FaCreditCard className="w-4 h-4" /> Fizetés · {formatHuf(subtotal)}
                            </>
                          )}
                        </button>
                        <p className="text-center text-xs text-gray-600">
                          A fizetést hamarosan a Stripe biztonságos rendszere kezeli.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={() => setAuthOpen(false)}
      />
    </>,
    document.body,
  );
}
