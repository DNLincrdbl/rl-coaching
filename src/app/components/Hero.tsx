'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaRocket, FaPlay, FaChevronDown } from 'react-icons/fa';

export default function Hero() {
  const [currentVersion, setCurrentVersion] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const heroVersions = [
    {
      badge: "Professzionális Rocket League Coaching",
      badgeIcon: "🎮",
      title: "Emelkedj ki a",
      highlightText: "játékosok",
      titleEnd: "közül",
      highlightColors: "from-orange-400 via-red-500 to-orange-400",
      glowColor: "orange",
      description: "Profi útmutatással és gyakorlati tippekkel segítek elérni a következő szintet a Rocket League-ben.",
      primaryButton: "Kezdjük el",
      secondaryButton: "Tudj meg többet"
    },
    {
      badge: "Egészséges Gaming Lifestyle",
      badgeIcon: "💪",
      title: "Légy erős és",
      highlightText: "egészséges",
      titleEnd: "gamer",
      highlightColors: "from-emerald-400 via-green-500 to-emerald-400",
      glowColor: "green",
      description: "Kombináld a gaming szenvedélyt az egészséges életmóddal. Építsd fel az erős tested, miközben fejlődsz a játékban.",
      primaryButton: "Kezdjük el",
      secondaryButton: "Tudj meg többet"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentVersion((prev) => (prev + 1) % heroVersions.length);
        setIsVisible(true);
      }, 500);
    }, 10000);
    return () => clearInterval(interval);
  }, [heroVersions.length]);

  const currentHero = heroVersions[currentVersion];
  const isGaming = currentVersion === 0;

  return (
    <div className="relative min-h-screen flex items-center bg-[#0A0F1C] overflow-hidden">
      {/* Animated Background Gradient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] ${
          isGaming ? 'bg-orange-500/30' : 'bg-green-500/30'
        } transition-colors duration-1000`}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className={`absolute bottom-1/4 -right-32 w-[600px] h-[600px] rounded-full blur-[150px] ${
          isGaming ? 'bg-red-500/20' : 'bg-emerald-500/20'
        } transition-colors duration-1000`}
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px] bg-purple-500/10"
      />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-left"
          >
            {/* Badge */}
            <motion.div
              key={`badge-${currentVersion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm transition-all duration-500 ${
                isGaming 
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' 
                  : 'bg-green-500/10 border-green-500/30 text-green-400'
              }`}>
                <span>{currentHero.badgeIcon}</span>
                {currentHero.badge}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1 
              key={`title-${currentVersion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-[1.1] text-white"
            >
              {currentHero.title}{' '}
              <span className={`bg-gradient-to-r ${currentHero.highlightColors} text-transparent bg-clip-text`}>
                {currentHero.highlightText}
              </span>{' '}
              {currentHero.titleEnd}
            </motion.h1>

            {/* Description */}
            <motion.p 
              key={`desc-${currentVersion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-400 mb-10 max-w-xl leading-relaxed"
            >
              {currentHero.description}
            </motion.p>

            {/* Buttons */}
            <motion.div 
              key={`buttons-${currentVersion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="#shop">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group px-8 py-4 rounded-xl text-base font-semibold text-white transition-all duration-300 flex items-center gap-2 ${
                    isGaming
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg hover:shadow-orange-500/25'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/25'
                  }`}
                >
                  <FaPlay className="w-3 h-3" />
                  {currentHero.primaryButton}
                </motion.button>
              </Link>
              <Link href="#about">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-base font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                >
                  {currentHero.secondaryButton}
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex gap-8 mt-12 pt-8 border-t border-white/10"
            >
              <div>
                <p className="text-3xl font-bold text-white">SSL</p>
                <p className="text-sm text-gray-500">Rang</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">10+</p>
                <p className="text-sm text-gray-500">Év tapasztalat</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-sm text-gray-500">Elégedett tanuló</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Glowing background */}
            <motion.div 
              className={`absolute w-[400px] h-[400px] rounded-full blur-[100px] transition-colors duration-1000 ${
                isGaming ? 'bg-orange-500/20' : 'bg-green-500/20'
              }`}
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Main Image Container */}
            <motion.div 
              className="relative z-10"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Outer Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className={`absolute -inset-8 rounded-full border-2 border-dashed transition-colors duration-1000 ${
                  isGaming ? 'border-orange-500/20' : 'border-green-500/20'
                }`}
              />
              
              {/* Middle Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className={`absolute -inset-4 rounded-full border transition-colors duration-1000 ${
                  isGaming ? 'border-red-500/10' : 'border-emerald-500/10'
                }`}
              />

              {/* Image */}
              <div className={`relative w-80 h-80 rounded-full overflow-hidden border-4 transition-all duration-1000 ${
                isGaming 
                  ? 'border-orange-500/30 shadow-2xl shadow-orange-500/20' 
                  : 'border-green-500/30 shadow-2xl shadow-green-500/20'
              }`}>
                <Image
                  src="/zoli/zolypic.jpg"
                  alt="JusTZoly"
                  fill
                  className="object-cover object-center scale-110"
                  priority
                />
                {/* Overlay gradient */}
                <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-1000 ${
                  isGaming ? 'from-orange-500/10 to-transparent' : 'from-green-500/10 to-transparent'
                }`} />
              </div>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => {
                const angle = (i * Math.PI * 2) / 6;
                const radius = 200;
                return (
                  <motion.div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full ${
                      isGaming ? 'bg-orange-400' : 'bg-green-400'
                    }`}
                    style={{
                      left: '50%',
                      top: '50%',
                      x: Math.cos(angle) * radius - 4,
                      y: Math.sin(angle) * radius - 4,
                    }}
                    animate={{
                      scale: [0.5, 1, 0.5],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeInOut"
                    }}
                  />
                );
              })}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-gray-500"
          >
            <span className="text-xs uppercase tracking-widest">Görgess</span>
            <FaChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}