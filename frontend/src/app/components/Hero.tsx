'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { IconType } from 'react-icons';
import { FaPlay, FaChevronDown, FaArrowRight, FaGamepad, FaDumbbell } from 'react-icons/fa';

export default function Hero() {
  const [currentVersion, setCurrentVersion] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const heroVersions: {
    badge: string; badgeIcon: IconType; title: string; highlightText: string;
    titleEnd: string; highlightColors: string; glowColor: string; description: string;
    primaryButton: string; secondaryButton: string;
  }[] = [
    {
      badge: "Professzionális Rocket League Coaching",
      badgeIcon: FaGamepad,
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
      badgeIcon: FaDumbbell,
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

  const BadgeIcon = currentHero.badgeIcon;

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Ambient brand glows on pure black */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-1/4 -left-40 w-[520px] h-[520px] rounded-full blur-[140px] ${
          isGaming ? 'bg-orange-500/25' : 'bg-emerald-500/25'
        } transition-colors duration-1000`}
      />
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className={`absolute bottom-1/4 -right-40 w-[600px] h-[600px] rounded-full blur-[160px] ${
          isGaming ? 'bg-rose-500/20' : 'bg-green-500/20'
        } transition-colors duration-1000`}
      />

      <div className="container mx-auto px-4 relative z-10 pt-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-left"
          >
            {/* Eyebrow badge */}
            <motion.div
              key={`badge-${currentVersion}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -16 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <span className={`rlm-eyebrow ${isGaming ? 'text-orange-300' : 'text-emerald-300'}`}>
                <BadgeIcon className="w-3.5 h-3.5" />
                {currentHero.badge}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              key={`title-${currentVersion}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -16 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-[1.02] tracking-tight text-white"
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -16 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-400 mb-10 max-w-xl leading-relaxed"
            >
              {currentHero.description}
            </motion.p>

            {/* Buttons */}
            <motion.div
              key={`buttons-${currentVersion}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -16 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="#pricing">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="rlm-btn-primary group px-8 py-4 text-base flex items-center gap-2"
                >
                  <FaPlay className="w-3 h-3" />
                  {currentHero.primaryButton}
                  <FaArrowRight className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </motion.button>
              </Link>
              <Link href="#about">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 rlm-card !rounded-[0.9rem] text-base font-semibold text-white hover:border-white/25 transition-all"
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
              className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/10 max-w-md"
            >
              {[
                { v: 'SSL', l: 'Rang' },
                { v: '10+', l: 'Év tapasztalat' },
                { v: '500+', l: 'Elégedett tanuló' },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-3xl font-black text-white">{s.v}</p>
                  <p className="text-sm text-gray-500">{s.l}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.35 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <motion.div
              className={`absolute w-[420px] h-[420px] rounded-full blur-[110px] transition-colors duration-1000 ${
                isGaming ? 'bg-orange-500/20' : 'bg-emerald-500/20'
              }`}
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10 rlm-orb">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
                className={`absolute -inset-8 rounded-full border border-dashed transition-colors duration-1000 ${
                  isGaming ? 'border-orange-500/25' : 'border-emerald-500/25'
                }`}
              />
              <div className="relative w-80 h-80 rounded-full overflow-hidden border border-white/15 shadow-2xl shadow-black/60">
                <Image
                  src="/zoli/zolypic.jpg"
                  alt="JusTZoly"
                  fill
                  className="object-cover object-center scale-110"
                  priority
                />
                <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-1000 ${
                  isGaming ? 'from-orange-500/15 to-transparent' : 'from-emerald-500/15 to-transparent'
                }`} />
              </div>

              {mounted && [...Array(6)].map((_, i) => {
                const angle = (i * Math.PI * 2) / 6;
                const radius = 200;
                return (
                  <motion.div
                    key={i}
                    className={`absolute w-1.5 h-1.5 rounded-full ${isGaming ? 'bg-orange-400' : 'bg-emerald-400'}`}
                    style={{ left: '50%', top: '50%', x: Math.cos(angle) * radius - 3, y: Math.sin(angle) * radius - 3 }}
                    animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
                  />
                );
              })}
            </div>
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