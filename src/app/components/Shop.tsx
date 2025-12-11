'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaPlay, FaGamepad, FaStar, FaTimes, FaDumbbell, FaUtensils, FaBrain, FaCheck } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const rocketLeagueServices = [
  {
    id: 'rlm',
    name: 'Rocket League Mesterfokon',
    description: 'Csatlakozz a legjobb fejlesztő programba kevesebb mint 150 forintért naponta!',
    price: 'Havi előfizetés',
    fullPrice: '3.990 Ft/hó',
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
    description: 'Foglalj időpontot és kapj exkluzív útmutatást!',
    price: 'Óránkénti díjazás',
    fullPrice: '5.990 Ft/óra',
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
    description: 'Foglalj időpontot és játszunk együtt!',
    price: 'Óránkénti díjazás',
    fullPrice: '3.990 Ft/óra',
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
    description: 'Töltsd fel a replayed és kapj részletes visszajelzést!',
    price: 'Elemzésenként',
    fullPrice: '2.990 Ft/elemzés',
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
    name: 'JusTZoly Edzésprogram',
    description: 'Hozd magad jó formába a saját testsúlyoddal!',
    price: 'Egyszeri vásárlás',
    fullPrice: '12.000 Ft',
    icon: FaDumbbell,
    color: 'from-green-500 to-teal-500',
    isPremium: false,
    features: ['Otthoni edzések', 'Táplálkozási tanácsok', 'Gaming-egészség egyensúly', 'Fokozatos fejlődés'],
    detailedDescription: 'Komplett otthoni fitness program gamereknek! Nincs szükség edzőteremre - csak a saját testsúlyoddal dolgozunk. Egészséges gamer életmód kialakítása.',
    benefits: ['50+ gyakorlat videóval', 'Táplálkozási útmutató', 'Gaming szünetek optimalizálása', 'Progresszív edzésterv', 'Életmód tanácsok'],
    duration: 'Élethosszig hozzáférés'
  },
  {
    id: 'cookbook',
    name: 'JusTZoly Receptkönyv',
    description: 'Edd azokat, amiket én, és érd el a célod!',
    price: 'Egyszeri vásárlás',
    fullPrice: '8.000 Ft',
    icon: FaUtensils,
    color: 'from-orange-500 to-red-500',
    isPremium: false,
    features: ['50+ gyors recept', 'Gaming-barát ételek', 'Tápanyag optimalizált', 'Egyszerű elkészítés'],
    detailedDescription: 'Speciálisan gamereknek készített szakácskönyv! Gyors, egészséges és finom receptek, amelyek nem zavarják meg a játékot.',
    benefits: ['5-15 perces receptek', 'Egy kézzel ehető ételek', 'Energianövelő snackek', 'Hidratáló italok', 'Gaming maratoni menük'],
    duration: 'Élethosszig hozzáférés'
  },
  {
    id: 'combo',
    name: 'Teljes JusTZoly Csomag',
    description: 'Szerezd meg mindkettőt olcsóbban!',
    price: 'Egyszeri vásárlás',
    fullPrice: '18.000 Ft',
    icon: FaDumbbell,
    color: 'from-emerald-500 to-cyan-500',
    isPremium: false,
    features: ['Otthoni edzések', '50+ gyors recept', 'Táplálkozási tanácsok', 'Gaming-egészség egyensúly'],
    detailedDescription: 'A teljes gamer életmód csomag! Kombináld az otthoni fitness programot az egészséges táplálkozással. Minden amit egy egészséges gamer életmódhoz szükséges.',
    benefits: ['50+ gyakorlat videóval', '5-15 perces receptek', 'Táplálkozási útmutató', 'Gaming szünetek optimalizálása', 'Progresszív edzésterv', 'Egy kézzel ehető ételek'],
    duration: 'Élethosszig hozzáférés'
  }
];

export default function Shop() {
  const isSingleOther = otherServices.length === 1;
  const [selectedService, setSelectedService] = useState<any>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const openModal = (service: any) => {
    setSelectedService(service);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedService(null);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <section id="shop" className="py-32 relative bg-[#0A0F1C]">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 -left-40 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 -right-40 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-orange-500/10 border border-orange-500/20 text-orange-400 backdrop-blur-sm"
            >
              ✨ Szolgáltatásaim
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mt-6 text-white"
            >
              Digitális{' '}
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                Termékek
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-gray-400 mt-6 max-w-2xl mx-auto"
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
              className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3"
            >
              <span className="text-orange-500">🎮</span>
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
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-orange-500/30 z-10">
                      ⭐ Premium
                    </div>
                  )}
                  <div
                    className={`relative p-6 rounded-2xl backdrop-blur-xl border cursor-pointer group flex flex-col h-[420px] overflow-hidden transition-all duration-300 ${
                      service.isPremium 
                        ? 'bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent border-orange-500/20 hover:border-orange-500/40 shadow-xl shadow-orange-500/5'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                    }`}
                  >
                  {/* Animated Background Glow */}
                  <motion.div 
                    className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      service.isPremium 
                        ? 'bg-gradient-to-br from-orange-500/10 to-red-500/5' 
                        : 'bg-gradient-to-br from-white/5 to-transparent'
                    }`}
                  />

                  
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mb-6 mx-auto relative">
                    <Image
                      src={service.icon}
                      alt={service.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-2 text-center h-12 flex items-center justify-center">
                    {service.name}
                  </h4>
                  
                  <p className="text-gray-400 text-sm mb-4 text-center flex-grow leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="text-center mb-4">
                    <span className={`text-2xl font-bold ${
                      service.isPremium 
                        ? 'bg-gradient-to-r from-orange-400 to-red-400' 
                        : 'bg-gradient-to-r from-blue-400 to-purple-400'
                    } text-transparent bg-clip-text`}>
                      {service.fullPrice}
                    </span>
                  </div>
                  
                  <motion.button 
                    onClick={() => openModal(service)}
                    className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
                      service.isPremium 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg hover:shadow-orange-500/25' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-blue-500/25'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center justify-center gap-2">
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
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />

          {/* Other Services */}
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3"
            >
              <span className="text-green-500">💪</span>
              Fitness
            </motion.h3>
            
            <div className={`${isSingleOther ? 'flex justify-center' : 'grid md:grid-cols-2 lg:grid-cols-3'} gap-8 max-w-4xl mx-auto`}>
              {otherServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.03, y: -8 }}
                  className="relative p-6 rounded-2xl backdrop-blur-xl border border-white/10 cursor-pointer group flex flex-col h-[420px] overflow-hidden bg-white/5 hover:bg-white/[0.07] hover:border-green-500/30 transition-all duration-300"
                >
                  {/* Animated Background Glow */}
                  <motion.div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-green-500/10 to-transparent" />

                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 mx-auto relative`}>
                    <service.icon className="w-12 h-12 text-white" />
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-2 text-center h-12 flex items-center justify-center">
                    {service.name}
                  </h4>
                  
                  <p className="text-gray-400 text-sm mb-4 text-center flex-grow leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text">
                      {service.fullPrice}
                    </span>
                  </div>
                  
                  <motion.button 
                    onClick={() => openModal(service)}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center justify-center gap-2">
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-[#0D1321] backdrop-blur-xl rounded-2xl p-6 max-w-lg w-full border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes className="w-4 h-4 text-gray-400" />
              </motion.button>

              {/* Header */}
              <div className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className={`w-16 h-16 mx-auto mb-3 rounded-2xl overflow-hidden ${
                    selectedService.isPremium 
                      ? 'bg-gradient-to-br from-orange-500 to-red-500' 
                      : selectedService.icon === FaDumbbell 
                        ? 'bg-gradient-to-br from-green-500 to-teal-500'
                        : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  } flex items-center justify-center shadow-xl`}
                >
                  {selectedService.icon === FaDumbbell ? (
                    <selectedService.icon className="w-8 h-8 text-white" />
                  ) : (
                    <Image
                      src={selectedService.icon}
                      alt={selectedService.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-white mb-2"
                >
                  {selectedService.name}
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center mb-4"
                >
                  <span className={`text-2xl font-bold ${
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
                className="space-y-4"
              >
                {/* Description */}
                <div>
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <FaGamepad className="w-4 h-4 text-orange-500" />
                    Részletes leírás
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {selectedService.detailedDescription}
                  </p>
                </div>

                {/* Benefits */}
                <div>
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <FaCheck className="w-4 h-4 text-green-500" />
                    Mit tartalmaz?
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedService.benefits.slice(0, 4).map((benefit: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center gap-2 p-2 bg-white/5 rounded-lg text-sm"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <FaPlay className="w-3 h-3 text-orange-500" />
                    Időtartam
                  </h3>
                  <p className="text-gray-400 text-sm">{selectedService.duration}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={closeModal}
                    className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Bezárás
                  </motion.button>
                  <motion.button
                    className={`flex-1 py-3 text-white rounded-xl font-bold text-sm ${
                      selectedService.isPremium 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg hover:shadow-orange-500/25' 
                        : selectedService.icon === FaDumbbell 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/25'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-blue-500/25'
                    }`}
                    whileHover={{ scale: 1.02 }}
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
