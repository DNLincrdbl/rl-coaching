'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AuthModal from './AuthModal';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <nav className="fixed w-full z-50 bg-[#0A0F1C]/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link 
              href="/" 
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text"
            >
              JusTZoly
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="#about" 
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Rólam
              </Link>
              <Link 
                href="#courses" 
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Kurzusok
              </Link>
              <Link 
                href="#contact" 
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Kapcsolat
              </Link>
              
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
                    <div className="absolute right-0 mt-2 w-48 bg-[#0A0F1C] border border-white/10 rounded-xl shadow-xl">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/courses"
                        className="block px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Kurzusaim
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        Kijelentkezés
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAuthModalOpen(true)}
                  className="ml-8 px-6 py-2.5 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition-all"
                >
                  Bejelentkezés
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar; 