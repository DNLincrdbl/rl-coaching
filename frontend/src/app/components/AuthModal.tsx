'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StageShell from './StageShell';

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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    token: '',
  });

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    const reset = new URLSearchParams(window.location.search).get('reset');
    if (reset && reset !== '1') {
      setMode('reset');
      setFormData((prev) => ({ ...prev, token: reset, password: '' }));
      setInfo('Add meg az új jelszavad.');
    }
  }, [isOpen]);

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
        setInfo(res.message);
      } else if (mode === 'reset') {
        await resetPassword(formData.token, formData.password);
        onLoginSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba történt. Próbáld újra.');
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === 'login' ? 'Bejelentkezés.' :
    mode === 'register' ? 'Regisztráció.' :
    mode === 'forgot' ? 'Elfelejtett jelszó.' :
    'Új jelszó.';

  const subtitle =
    mode === 'login' ? 'Üdvözöllek újra!' :
    mode === 'register' ? 'Hozz létre egy új fiókot' :
    mode === 'forgot' ? 'Add meg az e-mail címed a visszaállításhoz' :
    'Válassz egy új, biztonságos jelszót';

  const ghost =
    mode === 'login' ? 'Belép' :
    mode === 'register' ? 'Fiók' :
    mode === 'forgot' ? 'Jelszó' :
    'Újra';

  const submitLabel =
    mode === 'login' ? 'Bejelentkezés' :
    mode === 'register' ? 'Regisztráció' :
    mode === 'forgot' ? 'Visszaállítási link kérése' :
    'Jelszó módosítása';

  const inputClass =
    'w-full border-b border-white/20 bg-transparent py-3 text-lg text-white placeholder:text-white/30 transition focus:border-white focus:outline-none';

  return (
    <StageShell
      open={isOpen}
      onClose={onClose}
      z={250}
      label="Fiók"
      title={title}
      subtitle={subtitle}
      ghost={ghost}
    >
      {error && (
        <p className="mb-6 text-sm text-red-400" role="alert">{error}</p>
      )}
      {info && (
        <p className="mb-6 max-w-md text-sm leading-relaxed text-white/70">{info}</p>
      )}

      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Teljes név"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
            autoComplete="name"
            required
          />
        )}

        {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
          <input
            type="email"
            placeholder="E-mail cím"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputClass}
            autoComplete="email"
            required
          />
        )}

        {mode === 'reset' && (
          <input
            type="text"
            placeholder="Visszaállítási kód"
            value={formData.token}
            onChange={(e) => setFormData({ ...formData, token: e.target.value })}
            className={inputClass}
            required
          />
        )}

        {(mode === 'login' || mode === 'register' || mode === 'reset') && (
          <input
            type="password"
            placeholder={mode === 'login' ? 'Jelszó' : 'Jelszó, legalább 8 karakter, betű és szám'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={inputClass}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={mode === 'register' || mode === 'reset' ? 8 : undefined}
            required
          />
        )}

        {mode === 'login' && (
          <div>
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className="text-sm text-white/45 transition hover:text-white"
            >
              Elfelejtetted a jelszavad?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Feldolgozás...' : submitLabel}
        </button>
      </form>

      <div className="mt-8">
        {mode === 'login' && (
          <button
            type="button"
            onClick={() => switchMode('register')}
            className="text-sm text-white/45 transition hover:text-white"
          >
            Nincs még fiókod? Regisztrálj
          </button>
        )}
        {mode === 'register' && (
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="text-sm text-white/45 transition hover:text-white"
          >
            Már van fiókod? Jelentkezz be
          </button>
        )}
        {(mode === 'forgot' || mode === 'reset') && (
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="text-sm text-white/45 transition hover:text-white"
          >
            Vissza a bejelentkezéshez
          </button>
        )}
      </div>
    </StageShell>
  );
}
