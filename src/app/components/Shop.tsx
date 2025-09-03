'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaDumbbell, FaTimes, FaCheck, FaStar, FaPlay, FaGamepad } from 'react-icons/fa';
import { useState } from 'react';

const rocketLeagueServices = [
  {
    id: 'rlm',
    name: 'Rocket League Mesterfokon',
    description: 'Komplex fejlődési program havi előfizetéssel',
    price: 'Havi előfizetés',
    fullPrice: '15.000 Ft/hó',
    icon: '/icons/Ikon Rocket League Mesterfokon.jpg',
    color: 'from-orange-500 to-red-500',
    isPremium: true,
    features: ['Személyre szabott edzéstervek', 'Részletes videó elemzések', 'Közösségi támogatás', 'Folyamatos frissítések'],
    detailedDescription: 'A legátfogóbb Rocket League fejlődési program, amely minden szinten segít. Heti személyre szabott edzéstervek, részletes replay elemzések videóval, exkluzív közösségi hozzáférés és folyamatos tartalomfrissítések.',
    benefits: ['Heti 3-4 új edzésterv', 'Személyes replay elemzés', 'Discord közösség', 'Havi 1-1 coaching session', 'Exkluzív tartalmak'],
    duration: 'Havi előfizetés, bármikor lemondható'
  },
  {
    id: 'coaching',
    name: 'Coaching',
    description: 'Egyéni órák professzionális oktatóval',
    price: 'Óránként',
    fullPrice: '8.000 Ft/óra',
    icon: '/icons/Ikon Coaching.jpg',
    color: 'from-blue-500 to-purple-500',
    isPremium: false,
    features: ['Személyre szabott feedback', 'Replay elemzés', 'Gyakorlatok', 'Stratégiai tanácsok'],
    detailedDescription: 'Személyre szabott, egyéni coaching órák ahol közvetlenül velem dolgozhatsz. Minden óra a te egyéni szintedhez és céljaidhoz igazodik.',
    benefits: ['1-1 személyes coaching', 'Azonnali feedback', 'Célzott gyakorlatok', 'Replay elemzés együtt', 'Stratégiai fejlesztés'],
    duration: '60 perces sessions'
  },
  {
    id: 'play',
    name: 'Közös Játék',
    description: 'Játssz velem és tanulj közben',
    price: 'Óránként',
    fullPrice: '6.000 Ft/óra',
    icon: '/icons/icon_play_together.jpg',
    color: 'from-green-500 to-blue-500',
    isPremium: false,
    features: ['Gyakorlati tapasztalat', 'Valós idejű tanácsok', 'Csapatmunka', 'Stratégiai fejlődés'],
    detailedDescription: 'Játssz közvetlenül velem és tanulj a gyakorlatban! Ez a legjobb módja annak, hogy valós játékhelyzetekben fejlődj és azonnali visszajelzést kapj.',
    benefits: ['Valós játékhelyzetek', 'Azonnali tanácsok', 'Csapatjáték fejlesztés', 'Pozicionálás tanítás', 'Mechanikai tippek'],
    duration: '60-90 perces sessions'
  },
  {
    id: 'replay',
    name: 'Replay Elemzés',
    description: 'Részletes játék elemzés videóval',
    price: 'Elemzésenként',
    fullPrice: '4.000 Ft/elemzés',
    icon: '/icons/icon_elemzes.jpg',
    color: 'from-purple-500 to-pink-500',
    isPremium: false,
    features: ['Videó elemzés', 'Írásbeli feedback', 'Fejlődési javaslatok', 'Gyakorlatok'],
    detailedDescription: 'Küldd el a replay fájlod és kapsz egy részletes videó elemzést, ahol végigmegyek a játékodon és konkrét fejlődési javaslatokat adok.',
    benefits: ['Részletes videó elemzés', 'Írásbeli összefoglaló', 'Konkrét gyakorlatok', 'Hibák azonosítása', 'Fejlődési terv'],
    duration: '15-20 perces videó + írásbeli anyag'
  }
];

const otherServices = [
  {
    id: 'bodyweight',
    name: 'A JusTZoly Testsúly Program',
    description: 'Otthoni edzés program egészséges gamer élethez',
    price: 'Egyszeri vásárlás',
    fullPrice: '12.000 Ft',
    icon: FaDumbbell,
    color: 'from-green-500 to-teal-500',
    isPremium: false,
    features: ['Otthoni edzések', 'Táplálkozási tanácsok', 'Gaming-egészség egyensúly', 'Fokozatos fejlődés'],
    detailedDescription: 'Komplett otthoni fitness program gamereknek! Nincs szükség edzőteremre - csak a saját testsúlyoddal dolgozunk. Egészséges gamer életmód kialakítása.',
    benefits: ['50+ gyakorlat videóval', 'Táplálkozási útmutató', 'Gaming szünetek optimalizálása', 'Progresszív edzésterv', 'Életmód tanácsok'],
    duration: 'Élethosszig hozzáférés'
    }
];

export default function Shop() {
  const isSingleOther = otherServices.length === 1;
  const [selectedService, setSelectedService] = useState<any>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const openModal = (service: any) => {
    setSelectedService(service);
  };

  const closeModal = () => {
    setSelectedService(null);
  };

  return (
    <section id="shop" className="py-32 relative">
      {/* Enhanced Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-100/50 dark:via-indigo-500/5 to-transparent" />
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'white' : 'gray'} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Animated Background Orbs */}
      <motion.div 
        className="absolute top-10 -left-20 w-72 h-72 bg-gradient-to-r from-blue-400/8 to-purple-400/8 rounded-full blur-xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute -bottom-10 -right-20 w-96 h-96 bg-gradient-to-r from-green-400/6 to-teal-400/6 rounded-full blur-xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block text-indigo-600 dark:text-indigo-400 font-medium tracking-wider uppercase text-sm mb-6 px-4 py-2 bg-indigo-100/50 dark:bg-indigo-500/10 rounded-full border border-indigo-200/50 dark:border-indigo-500/20"
            >
              ✨ Szolgáltatásaim
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold mt-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent"
            >
              Digitális Termékek
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-400 mt-6 max-w-2xl mx-auto"
            >
              Válaszd ki a számodra legmegfelelőbb programot és kezdj fejlődni még ma!
            </motion.p>
          </div>

          {/* Rocket League Services */}
          <div className="mb-16">
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-8 text-center"
            >
              Rocket League
            </motion.h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {rocketLeagueServices.map((service, index) => (
                <motion.div 
                  key={service.id} 
                  className="relative"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.08,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -8,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  onHoverStart={() => setHoveredCard(service.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                >
                  {service.isPremium && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md shadow-orange-500/15 border border-white/20 z-10">
                      ⭐ Premium
                    </div>
                  )}
                  <div
                    className={`relative p-8 rounded-3xl backdrop-blur-lg border-2 cursor-pointer group flex flex-col h-[420px] overflow-hidden ${
                      service.isPremium 
                        ? 'bg-gradient-to-br from-orange-500/12 via-red-500/8 to-pink-500/12 border-orange-300/25 dark:border-orange-400/30 shadow-xl shadow-orange-500/8'
                        : 'bg-gradient-to-br from-white/15 via-blue-50/20 to-purple-50/15 dark:from-white/8 dark:via-blue-900/15 dark:to-purple-900/15 border-blue-200/30 dark:border-blue-400/25 shadow-xl shadow-blue-500/6'
                    }`}
                    style={{
                      transformStyle: 'preserve-3d'
                    }}
                  >
                  {/* Animated Background Glow */}
                  <motion.div 
                    className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      service.isPremium 
                        ? 'bg-gradient-to-br from-orange-400/6 to-red-400/6' 
                        : 'bg-gradient-to-br from-blue-400/6 to-purple-400/6'
                    }`}
                    animate={hoveredCard === service.id ? {
                      scale: [1, 1.01, 1],
                      opacity: [0.3, 0.5, 0.3]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  
                  <div className="w-28 h-28 rounded-3xl overflow-hidden mb-6 mx-auto border-3 border-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-400 dark:to-purple-400 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/8 to-purple-400/8 rounded-3xl" />
                    <Image
                      src={service.icon}
                      alt={service.name}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover relative z-10"
                    />
                    {hoveredCard === service.id && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-400/12 to-purple-400/12 rounded-3xl"
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                  
                  <motion.h4 
                    className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center h-14 flex items-center justify-center"
                    whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                  >
                    {service.name}
                  </motion.h4>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center flex-grow leading-relaxed h-20 flex items-start justify-center">
                    {service.description}
                  </p>
                  
                  <div className="text-center mb-6">
                    <motion.div
                      whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                      className="inline-block"
                    >
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">{service.price}</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-transparent bg-clip-text">
                        {service.fullPrice}
                      </span>
                    </motion.div>
                  </div>
                  
                  <motion.button 
                    onClick={() => openModal(service)}
                    className={`w-full py-4 rounded-2xl font-bold text-white relative overflow-hidden group/btn ${
                      service.isPremium 
                        ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-md shadow-orange-500/15' 
                        : 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 shadow-md shadow-blue-500/15'
                    }`}
                    whileHover={{ 
                      scale: 1.02,
                      y: -2,
                      transition: { duration: 0.15, ease: "easeOut" }
                    }}
                    whileTap={{ scale: 0.96, transition: { duration: 0.1 } }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2 w-full h-full">
                      <FaPlay className="w-3 h-3" />
                      Részletek
                    </span>
                  </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-white/20 to-transparent mb-16" />

          {/* Other Services */}
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-8 text-center"
            >
              Egyéb
            </motion.h3>
            
            <div className={`${isSingleOther ? 'flex justify-center' : 'grid md:grid-cols-2 lg:grid-cols-3'} gap-8 max-w-4xl mx-auto`}>
              {otherServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.1,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -8,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  onHoverStart={() => setHoveredCard(service.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="relative p-8 rounded-3xl backdrop-blur-lg border-2 border-green-200/30 dark:border-green-400/25 cursor-pointer group flex flex-col h-[420px] overflow-hidden bg-gradient-to-br from-green-50/20 via-teal-50/15 to-emerald-50/20 dark:from-green-900/15 dark:via-teal-900/10 dark:to-emerald-900/15 shadow-xl shadow-green-500/6"
                  style={{
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Animated Background Glow */}
                  <motion.div 
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-green-400/6 to-teal-400/6"
                    animate={hoveredCard === service.id ? {
                      scale: [1, 1.01, 1],
                      opacity: [0.3, 0.5, 0.3]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  <div className={`w-28 h-28 rounded-3xl bg-gradient-to-r ${service.color} flex items-center justify-center mb-6 mx-auto relative shadow-xl`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
                    <service.icon className="w-16 h-16 text-white relative z-10" />
                    {hoveredCard === service.id && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-green-400/12 to-teal-400/12 rounded-3xl"
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                  
                  <motion.h4 
                    className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center h-14 flex items-center justify-center"
                    whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                  >
                    {service.name}
                  </motion.h4>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center flex-grow leading-relaxed h-20 flex items-start justify-center">
                    {service.description}
                  </p>
                  
                  <div className="text-center mb-6">
                    <motion.div
                      whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                      className="inline-block"
                    >
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">{service.price}</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 text-transparent bg-clip-text">
                        {service.fullPrice}
                      </span>
                    </motion.div>
                  </div>
                  
                  <motion.button 
                    onClick={() => openModal(service)}
                    className="w-full py-4 bg-gradient-to-r from-green-500 via-teal-500 to-emerald-500 text-white rounded-2xl font-bold relative overflow-hidden group/btn shadow-md shadow-green-500/15"
                    whileHover={{ 
                      scale: 1.02,
                      y: -2,
                      transition: { duration: 0.15, ease: "easeOut" }
                    }}
                    whileTap={{ scale: 0.96, transition: { duration: 0.1 } }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2 w-full h-full">
                      <FaDumbbell className="w-3 h-3" />
                      Részletek
                    </span>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                onClick={closeModal}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-100/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </motion.button>

              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className={`w-20 h-20 mx-auto mb-6 rounded-2xl overflow-hidden ${
                    selectedService.isPremium 
                      ? 'bg-gradient-to-br from-orange-500 to-red-500' 
                      : selectedService.icon === FaDumbbell 
                        ? 'bg-gradient-to-br from-green-500 to-teal-500'
                        : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  } flex items-center justify-center shadow-xl`}
                >
                  {selectedService.icon === FaDumbbell ? (
                    <selectedService.icon className="w-10 h-10 text-white" />
                  ) : (
                    <Image
                      src={selectedService.icon}
                      alt={selectedService.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                >
                  {selectedService.name}
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-4 mb-6"
                >
                  <span className="text-lg text-gray-600 dark:text-gray-400">{selectedService.price}</span>
                  <span className={`text-3xl font-bold ${
                    selectedService.isPremium 
                      ? 'bg-gradient-to-r from-orange-600 to-red-600' 
                      : selectedService.icon === FaDumbbell 
                        ? 'bg-gradient-to-r from-green-600 to-teal-600'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600'
                  } text-transparent bg-clip-text`}>
                    {selectedService.fullPrice}
                  </span>
                </motion.div>

                {selectedService.isPremium && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-6"
                  >
                    <FaStar className="w-3 h-3" />
                    Premium Program
                  </motion.div>
                )}
              </div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-8"
              >
                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FaGamepad className="w-5 h-5 text-blue-500" />
                    Részletes leírás
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {selectedService.detailedDescription}
                  </p>
                </div>

                {/* Benefits */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FaCheck className="w-5 h-5 text-green-500" />
                    Mit tartalmaz?
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedService.benefits.map((benefit: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-blue-200/30 dark:border-blue-500/20">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FaPlay className="w-4 h-4 text-blue-500" />
                    Időtartam
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedService.duration}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    onClick={closeModal}
                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Bezárás
                  </motion.button>
                  <motion.button
                    className={`flex-1 py-4 text-white rounded-2xl font-bold shadow-lg ${
                      selectedService.isPremium 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/30' 
                        : selectedService.icon === FaDumbbell 
                          ? 'bg-gradient-to-r from-green-500 to-teal-500 shadow-green-500/30'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-blue-500/30'
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Megrendelem
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
