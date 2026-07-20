'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaKey, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const { signIn, signUp, forgotPassword, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    token: '',
  });

  useEffect(() => setMounted(true), []);

  // Escape closes the modal; lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password);
        onLoginSuccess();
      } else if (mode === 'register') {
        await signUp(formData.email, formData.password, formData.name);
        onLoginSuccess();
      } else if (mode === 'forgot') {
        const res = await forgotPassword(formData.email);
        if (res.resetToken) {
          setFormData((prev) => ({ ...prev, token: res.resetToken as string, password: '' }));
          setMode('reset');
          setInfo('A visszaállítási kódot automatikusan kitöltöttük. Adj meg egy új jelszót.');
        } else {
          setInfo(res.message);
        }
      } else if (mode === 'reset') {
        await resetPassword(formData.token, formData.password);
        onLoginSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba történt');
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === 'login' ? 'Bejelentkezés' :
    mode === 'register' ? 'Regisztráció' :
    mode === 'forgot' ? 'Elfelejtett jelszó' :
    'Új jelszó megadása';

  const subtitle =
    mode === 'login' ? 'Üdvözöllek újra!' :
    mode === 'register' ? 'Hozz létre egy új fiókot' :
    mode === 'forgot' ? 'Add meg az e-mail címed a visszaállításhoz' :
    'Válassz egy új, biztonságos jelszót';

  const submitLabel =
    mode === 'login' ? 'Bejelentkezés' :
    mode === 'register' ? 'Regisztráció' :
    mode === 'forgot' ? 'Visszaállítási link kérése' :
    'Jelszó módosítása';

  const inputClass =
    'w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors';

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[240]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[250] px-4"
          >
            <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/60">
              <div className="text-center mb-8">
                <h2 id="auth-modal-title" className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 text-transparent bg-clip-text">
                  {title}
                </h2>
                <p className="text-gray-400 mt-2">{subtitle}</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg" role="alert">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              {info && (
                <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-orange-300 text-sm">{info}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Teljes név"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass}
                      autoComplete="name"
                      required
                    />
                  </div>
                )}

                {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      placeholder="E-mail cím"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass}
                      autoComplete="email"
                      required
                    />
                  </div>
                )}

                {mode === 'reset' && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaKey className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Visszaállítási kód"
                      value={formData.token}
                      onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                )}

                {(mode === 'login' || mode === 'register' || mode === 'reset') && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      placeholder={mode === 'reset' ? 'Új jelszó (min. 8 karakter)' : 'Jelszó'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={inputClass}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      minLength={mode === 'register' || mode === 'reset' ? 8 : undefined}
                      required
                    />
                  </div>
                )}

                {mode === 'login' && (
                  <div className="text-right -mt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                    >
                      Elfelejtetted a jelszavad?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Feldolgozás...' : submitLabel}
                </button>
              </form>

              <div className="mt-6 text-center">
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Nincs még fiókod? Regisztrálj
                  </button>
                )}
                {mode === 'register' && (
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Már van fiókod? Jelentkezz be
                  </button>
                )}
                {(mode === 'forgot' || mode === 'reset') && (
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <FaArrowLeft className="w-3 h-3" /> Vissza a bejelentkezéshez
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
