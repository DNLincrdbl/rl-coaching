'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatHuf } from '@/lib/data/products';
import { api } from '@/lib/api';
import AuthModal from './AuthModal';
import SideDrawer from './SideDrawer';

type Stage = 'review' | 'processing' | 'success';

export default function CheckoutModal() {
  const { items, subtotal, isCheckoutOpen, closeCheckout, clear } = useCart();
  const { user } = useAuth();
  const [stage, setStage] = useState<Stage>('review');
  const [authOpen, setAuthOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const hasSubscription = items.some((i) => i.type === 'subscription');

  const handleClose = () => {
    closeCheckout();
    setError(null);
    setTimeout(() => setStage('review'), 250);
  };

  const handlePay = async () => {
    setStage('processing');
    setError(null);
    try {
      await api.post('/api/billing/demo-complete', {
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
      });
      window.dispatchEvent(new Event('rlm-profile-refresh'));
      setStage('success');
      clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'A helyi jóváírás nem sikerült.');
      setStage('review');
    }
  };

  if (!mounted) return null;

  const success = stage === 'success';

  return (
    <>
      <SideDrawer open={isCheckoutOpen} onClose={handleClose} z={230} title={success ? 'Kész' : 'Fizetés'}>
        {success ? (
          <div className="max-w-md">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg leading-relaxed text-white/60"
            >
              Köszönjük a vásárlást. A megrendelés visszaigazolását elküldtük
              {user?.email ? <> a <span className="text-white">{user.email}</span> címre</> : ''}.
            </motion.p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-8 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Bezárás
            </button>
          </div>
        ) : (
          <div className="max-w-xl">
            <ul>
              {items.map((item) => (
                <li key={item.id} className="flex items-baseline justify-between gap-6 border-b border-white/15 py-4">
                  <span className="text-lg font-semibold text-white">
                    {item.name}
                    {item.type !== 'subscription' && item.qty > 1 ? ` × ${item.qty}` : ''}
                    {item.type === 'subscription' && <span className="text-white/40"> · előfizetés</span>}
                  </span>
                  <span className="shrink-0 text-white/80">{formatHuf(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-end justify-between">
              <span className="text-[11px] uppercase tracking-[0.28em] text-white/40">Összesen</span>
              <span className="text-[clamp(2rem,4vw,3.2rem)] font-black leading-none tracking-[-0.04em] text-white">
                {formatHuf(subtotal)}
              </span>
            </div>
            {hasSubscription && (
              <p className="mt-4 max-w-md text-sm text-white/45">
                Az előfizetés havonta automatikusan megújul, bármikor lemondható.
              </p>
            )}

            {!user ? (
              <div className="mt-10 max-w-md">
                <p className="text-2xl font-black tracking-tight text-white">Jelentkezz be a fizetéshez</p>
                <p className="mt-3 text-base leading-relaxed text-white/55">
                  A vásárláshoz fiók szükséges, hogy a megrendelésed a profilodhoz kössük.
                </p>
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="mt-6 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  Bejelentkezés / Regisztráció
                </button>
              </div>
            ) : (
              <div className="mt-10 max-w-md">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">Számlázási fiók</p>
                <p className="mt-2 text-xl font-black text-white">{user.displayName}</p>
                <p className="text-white/50">{user.email}</p>
                {error && (
                  <p className="mt-4 text-sm text-red-400" role="alert">{error}</p>
                )}
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={stage === 'processing' || items.length === 0}
                  className="mt-8 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {stage === 'processing' ? 'Feldolgozás...' : `Fizetés · ${formatHuf(subtotal)}`}
                </button>
                <p className="mt-4 text-sm text-white/35">
                  Helyi teszt mód: a csomag a fiókodra kerül, Stripe nélkül.
                </p>
              </div>
            )}
          </div>
        )}
      </SideDrawer>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={() => setAuthOpen(false)}
      />
    </>
  );
}
