'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrophy, FaRocket, FaChartLine, FaUsers, FaCheck, FaCrown, 
  FaDiscord, FaVideo, FaClipboard, FaLightbulb, FaChalkboardTeacher,
  FaUserFriends, FaClock, FaStar
} from 'react-icons/fa';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import Cart from '@/components/Cart';

const ranks = [
  {
    id: 'ssl',
    name: 'Supersonic Legend',
    icon: '/ssl-logo.png',
    color: 'from-purple-600/10 via-purple-400/20 to-purple-900/10',
    borderColor: 'border-purple-400/20',
    hoverBorderColor: 'hover:border-purple-400/40',
    iconColor: 'text-purple-400',
    buttonGradient: 'from-purple-400 to-purple-600',
    glowColor: 'shadow-purple-400/20',
    price: '75,000 Ft',
    description: 'Pro szintű coaching a legmagasabb szinten játszóknak',
    features: [
      {
        icon: FaRocket,
        title: 'Pro Mechanikák Mesterszinten',
        description: 'Komplex mechanikák tökéletesítése, egyedi trükkök fejlesztése'
      },
      {
        icon: FaChartLine,
        title: 'Személyre Szabott Pro Tréningterv',
        description: 'Egyéni fejlődési terv versenyekre való felkészüléshez'
      },
      {
        icon: FaTrophy,
        title: '12 óra személyes coaching',
        description: 'Intenzív 1 az 1 tréning a legmagasabb szinten'
      },
      {
        icon: FaVideo,
        title: 'Részletes Replay Elemzés',
        description: 'Pro meccsek és saját játék részletes elemzése'
      },
      {
        icon: FaDiscord,
        title: 'Prémium Discord Támogatás',
        description: '24/7 közvetlen kapcsolat a coachokkal'
      },
      {
        icon: FaCrown,
        title: 'Verseny Felkészítés',
        description: 'Felkészítés nagyobb versenyekre, taktikai tervezés'
      },
      {
        icon: FaUserFriends,
        title: 'Pro Csapat Tréning',
        description: 'Csapatjáték fejlesztése pro szinten'
      },
      {
        icon: FaClipboard,
        title: 'Mentális Felkészítés',
        description: 'Versenyhelyzetekre való mentális felkészítés'
      }
    ]
  },
  {
    id: 'gc',
    name: 'Grand Champion',
    icon: '/gc-logo.png',
    color: 'from-red-500/10 via-red-500/20 to-red-900/10',
    borderColor: 'border-red-500/20',
    hoverBorderColor: 'hover:border-red-500/40',
    iconColor: 'text-red-500',
    buttonGradient: 'from-red-500 to-red-600',
    glowColor: 'shadow-red-500/20',
    price: '45,000 Ft',
    description: 'Haladó coaching package Grand Champion játékosoknak',
    features: [
      {
        icon: FaRocket,
        title: 'Pro Mechanikák Tökéletesítése',
        description: 'Flip reset, ceiling shot, air dribble és egyéb haladó technikák'
      },
      {
        icon: FaChartLine,
        title: 'Egyéni Tréningterv',
        description: 'Személyre szabott fejlődési terv és gyakorlatok'
      },
      {
        icon: FaTrophy,
        title: '8 óra személyes coaching',
        description: 'Intenzív 1 az 1 tréning sessions'
      },
      {
        icon: FaVideo,
        title: 'Részletes Replay Elemzés',
        description: 'Meccseid professzionális kiértékelése'
      },
      {
        icon: FaDiscord,
        title: 'Discord Támogatás',
        description: 'Korlátlan hozzáférés a Discord közösséghez'
      },
      {
        icon: FaCrown,
        title: 'Csapatjáték Stratégiák',
        description: 'Pro szintű taktikai és stratégiai képzés'
      }
    ]
  },
  {
    id: 'champ',
    name: 'Champion',
    icon: '/champ-logo.png',
    color: 'from-purple-500/10 via-purple-500/20 to-purple-900/10',
    borderColor: 'border-purple-500/20',
    hoverBorderColor: 'hover:border-purple-500/40',
    iconColor: 'text-purple-500',
    buttonGradient: 'from-purple-500 to-purple-600',
    glowColor: 'shadow-purple-500/20',
    price: '35,000 Ft',
    description: 'Középhaladó coaching package Champion játékosoknak',
    features: [
      {
        icon: FaRocket,
        title: 'Haladó Mechanikák',
        description: 'Air dribble, double tap és wall play technikák'
      },
      {
        icon: FaUsers,
        title: 'Csapatjáték Fejlesztése',
        description: 'Rotáció és pozicionálás tökéletesítése'
      },
      {
        icon: FaTrophy,
        title: '6 óra személyes coaching',
        description: 'Személyre szabott tréning alkalmak'
      },
      {
        icon: FaVideo,
        title: 'Replay Elemzés',
        description: 'Játékstílus és hibák elemzése'
      },
      {
        icon: FaDiscord,
        title: 'Discord Support',
        description: 'Hozzáférés a Discord közösséghez'
      }
    ]
  },
  {
    id: 'diamond',
    name: 'Diamond',
    icon: '/diamond-logo.png',
    color: 'from-blue-500/10 via-blue-500/20 to-blue-900/10',
    borderColor: 'border-blue-500/20',
    hoverBorderColor: 'hover:border-blue-500/40',
    iconColor: 'text-blue-500',
    buttonGradient: 'from-blue-500 to-blue-600',
    glowColor: 'shadow-blue-500/20',
    price: '25,000 Ft',
    description: 'Alapozó coaching package Diamond játékosoknak',
    features: [
      {
        icon: FaRocket,
        title: 'Alap Mechanikák',
        description: 'Fast aerial, powershot és alapvető kontroll'
      },
      {
        icon: FaUsers,
        title: 'Pozícionálás',
        description: 'Alap rotációs és pozicionálási elvek'
      },
      {
        icon: FaTrophy,
        title: '4 óra személyes coaching',
        description: 'Egyéni konzultációs alkalmak'
      },
      {
        icon: FaVideo,
        title: 'Replay Elemzés',
        description: 'Főbb hibák és fejlődési területek azonosítása'
      }
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum',
    icon: '/plat-logo.png',
    color: 'from-cyan-500/10 via-cyan-500/20 to-cyan-900/10',
    borderColor: 'border-cyan-500/20',
    hoverBorderColor: 'hover:border-cyan-500/40',
    iconColor: 'text-cyan-500',
    buttonGradient: 'from-cyan-500 to-cyan-600',
    glowColor: 'shadow-cyan-500/20',
    price: '20,000 Ft',
    description: 'Kezdő coaching package Platinum játékosoknak',
    features: [
      {
        icon: FaRocket,
        title: 'Kezdő Mechanikák',
        description: 'Alapvető irányítás és labdakezelés'
      },
      {
        icon: FaLightbulb,
        title: 'Játékértés Fejlesztése',
        description: 'Alapvető stratégiák és döntéshozatal'
      },
      {
        icon: FaChalkboardTeacher,
        title: '3 óra coaching',
        description: 'Alapvető készségek fejlesztése'
      },
      {
        icon: FaVideo,
        title: 'Alap Replay Elemzés',
        description: 'Legfontosabb fejlesztendő területek azonosítása'
      }
    ]
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: '/gold-logo.png',
    color: 'from-yellow-500/10 via-yellow-500/20 to-yellow-900/10',
    borderColor: 'border-yellow-500/20',
    hoverBorderColor: 'hover:border-yellow-500/40',
    iconColor: 'text-yellow-500',
    buttonGradient: 'from-yellow-500 to-yellow-600',
    glowColor: 'shadow-yellow-500/20',
    price: '15,000 Ft',
    description: 'Kezdő coaching package Gold játékosoknak',
    features: [
      {
        icon: FaRocket,
        title: 'Alapok Elsajátítása',
        description: 'Alap mechanikák és irányítás'
      },
      {
        icon: FaLightbulb,
        title: 'Játékértés Alapok',
        description: 'Alapvető játékhelyzetek megértése'
      },
      {
        icon: FaChalkboardTeacher,
        title: '2 óra coaching',
        description: 'Személyes oktatás és gyakorlás'
      },
      {
        icon: FaClock,
        title: 'Gyakorlási Terv',
        description: 'Személyre szabott gyakorlási rutin'
      }
    ]
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: '/silver-logo.png',
    color: 'from-gray-400/10 via-gray-400/20 to-gray-600/10',
    borderColor: 'border-gray-400/20',
    hoverBorderColor: 'hover:border-gray-400/40',
    iconColor: 'text-gray-400',
    buttonGradient: 'from-gray-400 to-gray-600',
    glowColor: 'shadow-gray-400/20',
    price: '12,000 Ft',
    description: 'Kezdő coaching package Silver játékosoknak',
    features: [
      {
        icon: FaRocket,
        title: 'Kezdő Lépések',
        description: 'Alapvető játékmechanikák megismerése'
      },
      {
        icon: FaLightbulb,
        title: 'Játék Alapok',
        description: 'A játék alapvető elemeinek megértése'
      },
      {
        icon: FaChalkboardTeacher,
        title: '1.5 óra coaching',
        description: 'Bevezetés a játék alapjaiba'
      },
      {
        icon: FaStar,
        title: 'Fejlődési Útmutató',
        description: 'Kezdő szintű gyakorlási tippek'
      }
    ]
  },
  {
    id: 'bronze',
    name: 'Bronze',
    icon: '/bronze-logo.png',
    color: 'from-orange-500/10 via-orange-500/20 to-orange-900/10',
    borderColor: 'border-orange-500/20',
    hoverBorderColor: 'hover:border-orange-500/40',
    iconColor: 'text-orange-500',
    buttonGradient: 'from-orange-500 to-orange-600',
    glowColor: 'shadow-orange-500/20',
    price: '10,000 Ft',
    description: 'Kezdő coaching package Bronze játékosoknak',
    features: [
      {
        icon: FaRocket,
        title: 'Első Lépések',
        description: 'Ismerkedés a játék alapjaival'
      },
      {
        icon: FaLightbulb,
        title: 'Alapvető Tudás',
        description: 'A játék legalapvetőbb elemeinek elsajátítása'
      },
      {
        icon: FaChalkboardTeacher,
        title: '1 óra coaching',
        description: 'Kezdő útmutató és alapok'
      },
      {
        icon: FaStar,
        title: 'Kezdő Csomag',
        description: 'Alapvető tippek és trükkök'
      }
    ]
  }
];

export default function PurchaseCourses() {
  const [expandedRank, setExpandedRank] = useState<string | null>(null);
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const { addItem, items } = useCart();

  const filteredRanks = filter === 'all' ? ranks : ranks.filter(rank => {
    if (filter === 'beginner') return ['bronze', 'silver', 'gold'].includes(rank.id);
    if (filter === 'intermediate') return ['platinum', 'diamond'].includes(rank.id);
    if (filter === 'advanced') return ['champ', 'gc'].includes(rank.id);
    if (filter === 'pro') return ['ssl'].includes(rank.id);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0F1C] pt-24 pb-16">
      <Cart />
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent mb-4"
          >
            Válaszd ki a szinted
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto mb-8"
          >
            Személyre szabott coaching csomagok minden szinthez. Válaszd ki a számodra megfelelő csomagot és kezdd el a fejlődést még ma!
          </motion.p>

          {/* Szűrők */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-white text-[#0A0F1C]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Összes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('beginner')}
              className={`px-6 py-2 rounded-lg transition-all ${
                filter === 'beginner'
                  ? 'bg-white text-[#0A0F1C]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Kezdő (Bronze-Gold)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('intermediate')}
              className={`px-6 py-2 rounded-lg transition-all ${
                filter === 'intermediate'
                  ? 'bg-white text-[#0A0F1C]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Középhaladó (Platinum-Diamond)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('advanced')}
              className={`px-6 py-2 rounded-lg transition-all ${
                filter === 'advanced'
                  ? 'bg-white text-[#0A0F1C]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Haladó (Champion-GC)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('pro')}
              className={`px-6 py-2 rounded-lg transition-all ${
                filter === 'pro'
                  ? 'bg-white text-[#0A0F1C]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Pro (SSL)
            </motion.button>
          </div>
        </div>

        <div className="space-y-6">
          {filteredRanks.map((rank, index) => (
            <motion.div
              key={rank.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative group ${
                selectedRank === rank.id ? 'scale-[1.02]' : ''
              }`}
            >
              <motion.div
                className={`bg-gradient-to-r ${rank.color} rounded-2xl backdrop-blur-lg border ${
                  rank.borderColor
                } ${rank.hoverBorderColor} transition-all cursor-pointer group hover:shadow-xl hover:${
                  rank.glowColor
                } relative z-10`}
                onClick={() => {
                  setExpandedRank(expandedRank === rank.id ? null : rank.id);
                  setSelectedRank(rank.id);
                }}
                whileHover={{ scale: selectedRank === rank.id ? 1 : 1.02 }}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-xl p-3">
                      <Image
                        src={rank.icon}
                        alt={rank.name}
                        fill
                        className="object-contain p-1 drop-shadow-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {rank.name} Coaching
                      </h2>
                      <p className={`text-sm font-medium ${rank.iconColor}`}>
                        {rank.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-400">Kezdő ár</p>
                      <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {rank.price}
                      </p>
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
                    transition={{ duration: 0.3 }}
                    className="relative -mt-4 z-0"
                  >
                    <div className={`pt-8 pb-6 px-8 rounded-b-2xl bg-gradient-to-r ${rank.color} backdrop-blur-lg border-x border-b ${rank.borderColor}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {rank.features.map((feature, featureIndex) => (
                          <motion.div
                            key={featureIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: featureIndex * 0.1 }}
                            className="flex gap-4"
                          >
                            <div className={`w-12 h-12 ${rank.iconColor} bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <feature.icon className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold mb-1">
                                {feature.title}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {feature.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const isInCart = items.some(item => item.rank === rank.name);
                          if (!isInCart) {
                            addItem({
                              id: rank.id,
                              name: rank.name,
                              price: rank.price,
                              rank: rank.name,
                              features: rank.features.map(f => f.title)
                            });
                          }
                        }}
                        className={`w-full mt-8 py-4 bg-gradient-to-r ${
                          items.some(item => item.rank === rank.name)
                            ? 'from-green-500 to-green-600'
                            : rank.buttonGradient
                        } rounded-xl font-medium text-white hover:shadow-lg hover:${
                          items.some(item => item.rank === rank.name)
                            ? 'shadow-green-500/20'
                            : rank.glowColor
                        } transition-all`}
                      >
                        {items.some(item => item.rank === rank.name)
                          ? 'A kosárban'
                          : 'Kosárba rakom'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 text-sm">
            Minden csomag tartalmazza az alapvető eszközöket a fejlődéshez.
            <br />
            Ha kérdésed van, keress minket bizalommal!
          </p>
        </motion.div>
      </div>
    </div>
  );
} 