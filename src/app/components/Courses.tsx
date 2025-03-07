'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

const ranks = [
  {
    id: 'gc',
    name: 'Grand Champion',
    icon: '/gclogo.png',
    color: 'from-red-500/10 via-red-500/20 to-red-900/10',
    borderColor: 'border-red-500/20',
    hoverBorderColor: 'hover:border-red-500/40',
    iconColor: 'text-red-500',
    glowColor: 'shadow-red-500/20',
    price: '45,000 Ft',
    features: [
      'Pro mechanikák tökéletesítése',
      'Egyéni tréningterv kialakítása',
      '8 óra személyes coaching',
      'Részletes replay elemzés',
      'Korlátlan Discord support',
      'Csapatjáték stratégiák'
    ]
  },
  {
    id: 'champ',
    name: 'Champion',
    icon: '/championlogo.png',
    color: 'from-purple-500/10 via-purple-500/20 to-purple-900/10',
    borderColor: 'border-purple-500/20',
    hoverBorderColor: 'hover:border-purple-500/40',
    iconColor: 'text-purple-500',
    glowColor: 'shadow-purple-500/20',
    price: '25,000 Ft',
    features: [
      'Haladó mechanikák gyakorlása',
      'Csapatjáték fejlesztése',
      '4 óra személyes coaching',
      'Replay elemzés',
      'Discord support'
    ]
  },
  {
    id: 'diamond',
    name: 'Diamond',
    icon: '/diamondlogo.webp',
    color: 'from-blue-500/10 via-blue-500/20 to-blue-900/10',
    borderColor: 'border-blue-500/20',
    hoverBorderColor: 'hover:border-blue-500/40',
    iconColor: 'text-blue-500',
    glowColor: 'shadow-blue-500/20',
    price: '15,000 Ft',
    features: [
      'Alapvető mechanikák',
      'Pozícionálás',
      '2 óra személyes coaching',
      'Alapszintű replay elemzés'
    ]
  }
];

export default function Courses() {
  const [expandedRank, setExpandedRank] = useState<string | null>(null);

  return (
    <section id="courses" className="py-16 md:py-32 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 md:mb-24">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-blue-400 font-medium tracking-wider uppercase text-sm mb-4 block"
          >
            Válaszd ki a szinted
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
            Coaching csomagok
          </h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {ranks.map((rank) => (
            <motion.div
              key={rank.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group/card"
            >
              <motion.div
                onClick={() => setExpandedRank(expandedRank === rank.id ? null : rank.id)}
                whileHover={{ scale: 1.01, y: -2 }}
                className={`bg-gradient-to-r ${rank.color} rounded-2xl backdrop-blur-lg border ${rank.borderColor} ${rank.hoverBorderColor} transition-all cursor-pointer group hover:shadow-xl hover:${rank.glowColor} relative z-10`}
              >
                <div className="p-4 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
                    <div className="flex items-center gap-4 md:gap-8">
                      <div className="w-16 h-16 md:w-20 md:h-20 relative bg-gradient-to-br from-white/10 to-transparent rounded-xl p-3 group-hover:from-white/20 transition-all duration-300 backdrop-blur-sm">
                        <Image
                          src={rank.icon}
                          alt={rank.name}
                          fill
                          className="object-contain p-1 drop-shadow-lg"
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                          {rank.name}
                        </h3>
                        <p className={`text-sm font-medium ${rank.iconColor} mt-1`}>Coaching csomag</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-400">Kezdő ár</p>
                        <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                          {rank.price}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedRank === rank.id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`w-6 h-6 md:w-8 md:h-8 ${rank.iconColor} opacity-60 group-hover:opacity-100`}
                      >
                        ↓
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <AnimatePresence>
                {expandedRank === rank.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ originY: 0 }}
                    className="relative -mt-4 z-0"
                  >
                    <div 
                      className={`pt-8 pb-6 px-6 md:px-10 rounded-b-2xl bg-gradient-to-r ${rank.color} backdrop-blur-lg border-x border-b ${rank.borderColor}`}
                    >
                      <ul className="space-y-4 md:space-y-5 pt-6 border-t border-white/10">
                        {rank.features.map((feature, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 md:gap-4 text-gray-300 text-base md:text-lg"
                          >
                            <span className={`${rank.iconColor} text-xl md:text-2xl`}>✓</span>
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full mt-8 md:mt-10 py-4 md:py-5 bg-gradient-to-r from-${rank.id === 'gc' ? 'red' : rank.id === 'champ' ? 'purple' : 'blue'}-500 to-${rank.id === 'gc' ? 'red' : rank.id === 'champ' ? 'purple' : 'blue'}-600 rounded-xl font-medium text-base md:text-lg hover:shadow-lg hover:shadow-${rank.id === 'gc' ? 'red' : rank.id === 'champ' ? 'purple' : 'blue'}-500/25 transition-all`}
                      >
                        Választom ezt a csomagot
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 