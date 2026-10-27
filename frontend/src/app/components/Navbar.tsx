'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthModal from './AuthModal';
import CartDrawer from './CartDrawer';
import CheckoutModal from './CheckoutModal';
import { FaUser, FaSignOutAlt, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { errorMessage, showToast } from '@/lib/toast';
import RlmLogo from './RlmLogo';

const handledEmailChanges = new Set<string>();

const Navbar = () => {
  const { user, loading, logout, confirmEmail, confirmEmailChange } = useAuth();
  const { count, openCart } = useCart();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || loading) return;
    const q = new URLSearchParams(window.location.search);
    if (q.get('login') === '1') {
      q.delete('login');
      const cleaned = `${window.location.pathname}${q.toString() ? `?${q}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', cleaned);
      if (!user) setIsAuthModalOpen(true);
    }
    const reset = q.get('reset');
    if (reset && reset !== '1') {
      setIsAuthModalOpen(true);
    }
    const confirm = q.get('confirm');
    if (confirm === 'error') {
      showToast('A megerősítő link érvénytelen vagy lejárt.');
      q.delete('confirm');
      const next = `${window.location.pathname}${q.toString() ? `?${q}` : ''}`;
      window.history.replaceState({}, '', next);
      return;
    }
    if (confirm && confirm !== '1') {
      void confirmEmail(confirm)
        .then(() => {
          showToast('E-mail cím megerősítve.', 'success');
          router.push('/dashboard');
        })
        .catch((e) => showToast(errorMessage(e, 'A megerősítés nem sikerült.')))
        .finally(() => {
          q.delete('confirm');
          const next = `${window.location.pathname}${q.toString() ? `?${q}` : ''}`;
          window.history.replaceState({}, '', next);
        });
    }
    const emailChange = q.get('emailChange');
    if (emailChange && emailChange !== '1' && !handledEmailChanges.has(emailChange)) {
      handledEmailChanges.add(emailChange);
      q.delete('emailChange');
      const cleaned = `${window.location.pathname}${q.toString() ? `?${q}` : ''}`;
      window.history.replaceState({}, '', cleaned);
      void confirmEmailChange(emailChange)
        .then((signedIn) => {
          showToast('Az új e-mail cím megerősítve.', 'success');
          if (signedIn) router.push('/dashboard/settings');
          else setIsAuthModalOpen(true);
        })
        .catch((e) => showToast(errorMessage(e, 'A megerősítés nem sikerült.')));
    }
  }, [user, loading, confirmEmail, confirmEmailChange, router]);

  const handleLoginSuccess = () => {
    setIsAuthModalOpen(false);
    router.push('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileMenuOpen(false);
    } catch {
      setIsProfileMenuOpen(false);
    }
  };

  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const navLink = 'text-[13px] font-medium text-white/65 transition hover:text-white';

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] px-3 pt-3 md:px-5 md:pt-4">
        <nav className="pointer-events-auto mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full border border-white/15 bg-black/55 px-3 backdrop-blur-xl md:h-[3.6rem] md:px-4">
          <button onClick={scrollToTop} className="shrink-0 pl-1" aria-label="RLM">
            <RlmLogo height={32} priority />
          </button>

          <div className="hidden items-center gap-7 md:flex">
            <button type="button" onClick={() => smoothScrollTo('shop')} className={navLink}>
              Digitális termékek
            </button>
            <button type="button" onClick={() => smoothScrollTo('about')} className={navLink}>
              Rólam
            </button>
            <button type="button" onClick={() => smoothScrollTo('contact')} className={navLink}>
              Kapcsolat
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCart}
              aria-label="Kosár megnyitása"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/40"
            >
              <FaShoppingCart className="h-3.5 w-3.5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">
                  {count}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
                >
                  <FaUser className="h-3.5 w-3.5" />
                  <span className="max-w-[8rem] truncate">{user.displayName || 'Profil'}</span>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0C] shadow-2xl">
                    <Link
                      href="/dashboard"
                      className="block border-b border-white/5 px-4 py-3 text-sm text-white hover:bg-white/5"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <FaUser className="h-4 w-4 text-white/40" />
                        Profil
                      </span>
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-3 text-sm text-white hover:bg-white/5"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Rocket League Mesterfokon
                    </Link>
                    <span className="flex items-center gap-2 px-4 py-3 text-sm text-white/35">
                      JusTZoly Edzésprogram
                      <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px]">Hamarosan</span>
                    </span>
                    <span className="flex items-center gap-2 border-b border-white/5 px-4 py-3 text-sm text-white/35">
                      JusTZoly Receptkönyv
                      <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px]">Hamarosan</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5"
                    >
                      <FaSignOutAlt className="h-4 w-4" />
                      Kijelentkezés
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 md:inline-flex"
              >
                Bejelentkezés
              </button>
            )}

            <button
              type="button"
              aria-label="Menü megnyitása"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 md:hidden"
            >
              <span className="relative block h-3 w-4">
                <span className={`absolute left-0 top-0 block h-px w-4 bg-white transition ${isMobileMenuOpen ? 'top-1.5 rotate-45' : ''}`} />
                <span className={`absolute left-0 top-1.5 block h-px w-4 bg-white transition ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`absolute left-0 top-3 block h-px w-4 bg-white transition ${isMobileMenuOpen ? 'top-1.5 -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className="pointer-events-auto mx-auto mt-2 max-w-6xl rounded-3xl border border-white/10 bg-black/90 p-2 backdrop-blur-xl md:hidden">
            <button
              type="button"
              onClick={() => { smoothScrollTo('shop'); setIsMobileMenuOpen(false); }}
              className="block w-full rounded-2xl px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5"
            >
              Digitális termékek
            </button>
            <button
              type="button"
              onClick={() => { smoothScrollTo('about'); setIsMobileMenuOpen(false); }}
              className="block w-full rounded-2xl px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5"
            >
              Rólam
            </button>
            <button
              type="button"
              onClick={() => { smoothScrollTo('contact'); setIsMobileMenuOpen(false); }}
              className="block w-full rounded-2xl px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5"
            >
              Kapcsolat
            </button>
            <div className="p-2">
              {user ? (
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-sm text-red-400 hover:bg-white/5"
                >
                  <FaSignOutAlt className="h-4 w-4" /> Kijelentkezés
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }}
                  className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black"
                >
                  Bejelentkezés
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <CartDrawer />
      <CheckoutModal />
    </>
  );
};

export default Navbar;
