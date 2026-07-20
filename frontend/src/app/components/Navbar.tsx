'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AuthModal from './AuthModal';
import CartDrawer from './CartDrawer';
import CheckoutModal from './CheckoutModal';
import { FaUser, FaSignOutAlt, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { count, openCart } = useCart();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Open the login modal automatically when redirected with ?login=1
  // (e.g. from the dashboard auth guard). Reading window avoids needing a
  // Suspense boundary for useSearchParams.
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('login') === '1' && !user) {
      setIsAuthModalOpen(true);
    }
  }, [user]);

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
      behavior: 'smooth'
    });
  };

  return (
    <>
      <nav className="fixed w-full z-[100] bg-black/70 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <button 
              onClick={scrollToTop}
              className="group relative"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <span className="text-3xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 text-transparent bg-clip-text">
                  JusTZoly
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/20 via-red-500/20 to-orange-400/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </button>
            
            {/* Mobile controls */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={openCart}
                aria-label="Kosár megnyitása"
                className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <FaShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-[11px] font-bold text-white flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
              <button
                aria-label="Menü megnyitása"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span className="sr-only">Menu</span>
                <div className="relative w-6 h-6 text-current">
                  <span className={`absolute left-0 top-1 block h-0.5 w-6 bg-current transition-transform ${isMobileMenuOpen ? 'translate-y-2 rotate-45' : ''}`} />
                  <span className={`absolute left-0 top-3 block h-0.5 w-6 bg-current transition-opacity ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                  <span className={`absolute left-0 top-5 block h-0.5 w-6 bg-current transition-transform ${isMobileMenuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
                </div>
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => smoothScrollTo('shop')}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Digitális termékek
              </button>
              <button 
                onClick={() => smoothScrollTo('about')}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Rólam
              </button>
              <button 
                onClick={() => smoothScrollTo('contact')}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Kapcsolat
              </button>

              <button
                onClick={openCart}
                aria-label="Kosár megnyitása"
                className="relative p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              >
                <FaShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-[11px] font-bold text-white flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <FaUser className="w-5 h-5" />
                    <span className="text-sm font-medium">{user.displayName || 'Profil'}</span>
                  </button>

                  {/* Profile Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#0A0A0C] border border-white/10 rounded-xl shadow-xl z-50">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors border-b border-white/5"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <FaUser className="w-4 h-4 text-gray-400" />
                          Profil
                        </span>
                      </Link>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-orange-500">🚀</span>
                          Rocket League Mesterfokon
                        </span>
                      </Link>
                      <Link
                        href="#"
                        className="block px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                        onClick={(e) => e.preventDefault()}
                      >
                        <span className="flex items-center gap-2">
                          <span>💪</span>
                          JusTZoly Edzésprogram
                          <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded ml-auto">Hamarosan</span>
                        </span>
                      </Link>
                      <Link
                        href="#"
                        className="block px-4 py-3 text-sm text-gray-500 cursor-not-allowed border-b border-white/5"
                        onClick={(e) => e.preventDefault()}
                      >
                        <span className="flex items-center gap-2">
                          <span>📖</span>
                          JusTZoly Receptkönyv
                          <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded ml-auto">Hamarosan</span>
                        </span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        Kijelentkezés
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-6 py-2.5 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition-all"
                  >
                    Bejelentkezés
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-20 inset-x-0 z-[100] bg-black/90 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <button 
              onClick={() => { smoothScrollTo('shop'); setIsMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5"
            >
              Digitális termékek
            </button>
            <button 
              onClick={() => { smoothScrollTo('about'); setIsMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5"
            >
              Rólam
            </button>
            <button 
              onClick={() => { smoothScrollTo('contact'); setIsMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5"
            >
              Kapcsolat
            </button>
            <div className="pt-2">
              {user ? (
                <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="w-full px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-white/5 flex items-center gap-2">
                  <FaSignOutAlt className="w-4 h-4" /> Kijelentkezés
                </button>
              ) : (
                <button onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }} className="w-full px-3 py-3 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20">
                  Bejelentkezés
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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