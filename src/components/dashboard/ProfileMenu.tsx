'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaCog, 
  FaSignOutAlt, 
  FaHistory, 
  FaBell, 
  FaQuestionCircle,
  FaChevronDown
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const menuItems = [
    {
      icon: FaUser,
      label: 'Profil',
      onClick: () => {
        // TODO: Navigate to profile page
        setIsOpen(false);
      }
    },
    {
      icon: FaHistory,
      label: 'Kurzusaim',
      onClick: () => {
        // TODO: Navigate to courses page
        setIsOpen(false);
      }
    },
    {
      icon: FaBell,
      label: 'Értesítések',
      onClick: () => {
        // TODO: Navigate to notifications
        setIsOpen(false);
      }
    },
    {
      icon: FaCog,
      label: 'Beállítások',
      onClick: () => {
        // TODO: Navigate to settings
        setIsOpen(false);
      }
    },
    {
      icon: FaQuestionCircle,
      label: 'Segítség',
      onClick: () => {
        // TODO: Navigate to help
        setIsOpen(false);
      }
    },
    {
      icon: FaSignOutAlt,
      label: 'Kijelentkezés',
      onClick: () => {
        signOut();
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-2 transition-colors"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || 'User'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <FaUser className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-white">
            {user?.displayName || 'Felhasználó'}
          </p>
          <p className="text-xs text-gray-400">
            {user?.email}
          </p>
        </div>
        <FaChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Háttér overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Menü panel */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 bg-[#0A0F1C] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    {user?.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <FaUser className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {user?.displayName || 'Felhasználó'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="py-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 