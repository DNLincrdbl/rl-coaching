'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRLM } from '@/contexts/RLMContext';
import { api } from '@/lib/api';
import { errorMessage, showToast } from '@/lib/toast';

const fieldClass =
  'w-full border-b border-white/20 bg-transparent py-3 text-lg text-white placeholder:text-white/30 transition focus:border-white focus:outline-none';

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const { profile } = useRLM();
  const [name, setName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(profile.username);
  const [nextEmail, setNextEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [identityBusy, setIdentityBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);

  useEffect(() => {
    setName(user?.displayName || '');
  }, [user?.displayName]);

  useEffect(() => {
    setUsername(profile.username);
  }, [profile.username]);

  const saveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentityError(null);
    setIdentityBusy(true);
    try {
      await api.patch('/api/account/identity', { displayName: name, username });
      await refresh();
      window.dispatchEvent(new Event('rlm-profile-refresh'));
      showToast('Az azonosító mentve.', 'success');
    } catch (err) {
      setIdentityError(errorMessage(err, 'A mentés nem sikerült.'));
    } finally {
      setIdentityBusy(false);
    }
  };

  const saveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailBusy(true);
    try {
      const res = await api.post<{ message: string; emailSent: boolean }>('/api/account/email', {
        email: nextEmail,
        currentPassword: emailPassword,
      });
      setEmailPassword('');
      setNextEmail('');
      window.dispatchEvent(new Event('rlm-profile-refresh'));
      showToast(res.message, res.emailSent ? 'success' : 'info');
    } catch (err) {
      setEmailError(errorMessage(err, 'Az e-mail cím módosítása nem sikerült.'));
    } finally {
      setEmailBusy(false);
    }
  };

  const cancelEmail = async () => {
    setCancelBusy(true);
    setEmailError(null);
    try {
      await api.post('/api/account/email/cancel', {});
      window.dispatchEvent(new Event('rlm-profile-refresh'));
      showToast('A címváltást visszavontuk.', 'success');
    } catch (err) {
      setEmailError(errorMessage(err, 'A visszavonás nem sikerült.'));
    } finally {
      setCancelBusy(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordBusy(true);
    try {
      await api.post('/api/account/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      showToast('Jelszó megváltoztatva. A többi eszközön újra be kell lépned.', 'success');
    } catch (err) {
      setPasswordError(errorMessage(err, 'A jelszó módosítása nem sikerült.'));
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/40">Fiók</p>
      <h1>Beállítások.</h1>
      <p className="mt-3 max-w-md text-white/50">
        A név és a felhasználónév itt látszik. Belépni az e-mail címeddel tudsz. Az e-mail és a jelszó csak a jelenlegi jelszóval változik.
      </p>

      <form onSubmit={saveIdentity} className="mt-12 space-y-6 border-t border-white/10 pt-8">
        <div>
          <h2 className="text-2xl font-black tracking-[-0.04em] text-white">Azonosító</h2>
          <p className="mt-2 text-sm text-white/45">A felhasználónév 3–24 karakter: kisbetű, szám, aláhúzás.</p>
        </div>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">Felhasználónév</span>
          <input
            className={fieldClass}
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24))}
            autoComplete="username"
            minLength={3}
            maxLength={24}
            required
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">Név</span>
          <input
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={80}
            required
          />
        </label>
        {identityError && <p className="text-sm text-red-400">{identityError}</p>}
        <button type="submit" className="rlm-btn-primary px-5 py-2.5 text-sm" disabled={identityBusy}>
          {identityBusy ? 'Mentés…' : 'Mentés'}
        </button>
      </form>

      <form onSubmit={saveEmail} className="mt-14 space-y-6 border-t border-white/10 pt-8">
        <div>
          <h2 className="text-2xl font-black tracking-[-0.04em] text-white">E-mail</h2>
          <p className="mt-2 text-sm text-white/45">
            Jelenlegi cím: <span className="text-white">{profile.email || user?.email}</span>
            {profile.emailVerified ? '' : ' · még nincs megerősítve'}
          </p>
        </div>
        {profile.pendingEmail && (
          <div className="flex flex-col gap-3 rounded-2xl border border-white/15 p-4 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-white/70">
              Várakozik a megerősítésre: <span className="text-white">{profile.pendingEmail}</span>. A régi címed addig él.
            </p>
            <button
              type="button"
              onClick={cancelEmail}
              disabled={cancelBusy}
              className="text-sm text-white/60 hover:text-white"
            >
              {cancelBusy ? 'Visszavonás…' : 'Visszavonás'}
            </button>
          </div>
        )}
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">Új e-mail cím</span>
          <input
            className={fieldClass}
            type="email"
            value={nextEmail}
            onChange={(e) => setNextEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">Jelenlegi jelszó</span>
          <input
            className={fieldClass}
            type="password"
            value={emailPassword}
            onChange={(e) => setEmailPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {emailError && <p className="text-sm text-red-400">{emailError}</p>}
        <button type="submit" className="rlm-btn-primary px-5 py-2.5 text-sm" disabled={emailBusy}>
          {emailBusy ? 'Küldés…' : 'Megerősítő levél'}
        </button>
      </form>

      <form onSubmit={savePassword} className="mt-14 space-y-6 border-t border-white/10 pt-8">
        <div>
          <h2 className="text-2xl font-black tracking-[-0.04em] text-white">Jelszó</h2>
          <p className="mt-2 text-sm text-white/45">Legalább 8 karakter, betű és szám. A többi belépés ezzel megszűnik.</p>
        </div>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">Jelenlegi jelszó</span>
          <input
            className={fieldClass}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">Új jelszó</span>
          <input
            className={fieldClass}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
        <button type="submit" className="rlm-btn-primary px-5 py-2.5 text-sm" disabled={passwordBusy}>
          {passwordBusy ? 'Csere…' : 'Jelszó csere'}
        </button>
      </form>
    </div>
  );
}
