'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

const coachingPackages = [
  {
    id: 'grand-champion',
    name: 'Grand Champion',
    subtitle: 'Coaching csomag',
    icon: '/gclogo.png',
    price: '45,000 Ft',
    bgColor: 'bg-gradient-to-br from-red-900/20 to-red-800/20',
    borderColor: 'border-red-800/20',
    hoverBorderColor: 'hover:border-red-800/40',
    iconColor: 'text-red-500',
    subtitleColor: 'text-red-500',
  },
  {
    id: 'champion',
    name: 'Champion',
    subtitle: 'Coaching csomag',
    icon: '/championlogo.png',
    price: '25,000 Ft',
    bgColor: 'bg-gradient-to-br from-purple-900/20 to-purple-800/20',
    borderColor: 'border-purple-800/20',
    hoverBorderColor: 'hover:border-purple-800/40',
    iconColor: 'text-purple-500',
    subtitleColor: 'text-purple-500',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    subtitle: 'Coaching csomag',
    icon: '/diamondlogo.webp',
    price: '15,000 Ft',
    bgColor: 'bg-gradient-to-br from-blue-900/20 to-blue-800/20',
    borderColor: 'border-blue-800/20',
    hoverBorderColor: 'hover:border-blue-800/40',
    iconColor: 'text-blue-500',
    subtitleColor: 'text-blue-500',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-blue-500 text-sm font-medium mb-2">VÁLASZD KI A SZINTED</h2>
          <h1 className="text-4xl font-bold text-white mb-6">Coaching csomagok</h1>
          <Link
            href="/courses/purchase"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-medium transition-colors cursor-pointer"
          >
            <FaShoppingCart className="w-5 h-5" />
            Vásárlás
          </Link>
        </div>

        <div className="space-y-4">
          {coachingPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${pkg.bgColor} border ${pkg.borderColor} ${pkg.hoverBorderColor} rounded-2xl p-6 transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${pkg.bgColor}`}>
                    <Image 
                      src={pkg.icon} 
                      alt={pkg.name}
                      width={32}
                      height={32}
                      className={pkg.iconColor}
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                    <p className={`text-sm ${pkg.subtitleColor}`}>{pkg.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Kezdő ár</p>
                    <p className="text-2xl font-bold text-white">{pkg.price}</p>
                  </div>
                  <Link
                    href="/courses/purchase"
                    className={`inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer`}
                  >
                    Kiválasztom
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
