'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
{/*
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';
*/}

{/*
function FennecModel() {
  const { scene } = useGLTF('/fennec/scene.gltf');
  return <primitive object={scene} />;
}

// Preload the model
useGLTF.preload('/fennec/scene.gltf');
*/}

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: [0.5, 0.8, 0.5],
    scale: [0.8, 1.2, 0.8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 0.5
    }
  }
};

const contentVariants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 1
    }
  }
};

export default function Hero() {
  const [currentVersion, setCurrentVersion] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const heroVersions = [
    {
      // Gaming verzió
      badge: "Professzionális Rocket League Coaching",
      badgeColors: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10",
      title: "Emelkedj ki a",
      highlightText: "játékosok",
      titleEnd: "közül",
      highlightColors: "from-blue-400 via-purple-400 to-blue-400",
      description: "Személyre szabott edzéstervvel és profi útmutatással segítek elérni a következő szintet a Rocket League-ben.",
      primaryButton: "Kezdjük el",
      primaryButtonColors: "from-blue-500 to-purple-500",
      primaryButtonShadow: "hover:shadow-blue-500/25",
      secondaryButton: "Tudj meg többet"
    },
    {
      // Egészség verzió
      badge: "Egészséges Gaming Lifestyle",
      badgeColors: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/10",
      title: "Légy erős és",
      highlightText: "egészséges",
      titleEnd: "gamer",
      highlightColors: "from-emerald-400 via-green-500 to-emerald-400",
      description: "Kombináld a gaming szenvedélyt az egészséges életmóddal. Építsd fel az erős tested, miközben fejlődsz a játékban.",
      primaryButton: "Egészséges program",
      primaryButtonColors: "from-green-500 to-emerald-500",
      primaryButtonShadow: "hover:shadow-green-500/25",
      secondaryButton: "Fitness útmutató"
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

  return (
    <div className="relative h-screen flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-blue-50/80 to-gray-50 dark:from-[#0A0F1C] dark:via-[#1a1f2c]/80 dark:to-[#0A0F1C]" />
      
      {/* Animated Glow Effects */}
      <motion.div
        variants={glowVariants}
        initial="initial"
        animate="animate"
        className="absolute top-1/3 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
      />
      <motion.div
        variants={glowVariants}
        initial="initial"
        animate="animate"
        className="absolute bottom-1/3 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"
      />
      
             {/* Grid Pattern */}
       <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 0.2 }}
         transition={{ duration: 1, delay: 1 }}
         className="absolute inset-0"
         style={{
           backgroundImage: `radial-gradient(circle at 1px 1px, ${typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'white' : 'gray'} 1px, transparent 0)`,
           backgroundSize: '40px 40px'
         }}
       />

      <div className="container mx-auto px-4 relative z-10 h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto">
          {/* Left Content */}
          <motion.div
            variants={contentVariants}
            initial="initial"
            animate="animate"
            className="text-left"
          >
            <motion.div
              key={`badge-${currentVersion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isVisible ? 1 : 0, 
                y: isVisible ? 0 : -20 
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="mb-6"
            >
              <span className={`${currentHero.badgeColors} font-medium tracking-wider uppercase text-sm inline-block mb-4 px-4 py-2 rounded-full transition-all duration-500`}>
                {currentHero.badge}
              </span>
            </motion.div>

            <motion.h1 
              key={`title-${currentVersion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isVisible ? 1 : 0, 
                y: isVisible ? 0 : -20 
              }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
              className="text-4xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              {currentHero.title}{' '}
              <span className={`bg-gradient-to-r ${currentHero.highlightColors} text-transparent bg-clip-text transition-all duration-500`}>
                {currentHero.highlightText}
              </span>{' '}
              {currentHero.titleEnd}
            </motion.h1>

            <motion.p 
              key={`desc-${currentVersion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isVisible ? 1 : 0, 
                y: isVisible ? 0 : -20 
              }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl leading-relaxed"
            >
              {currentHero.description}
            </motion.p>

            <motion.div 
              key={`buttons-${currentVersion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isVisible ? 1 : 0, 
                y: isVisible ? 0 : -20 
              }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="#shop">
                <motion.button
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`px-6 py-3 bg-gradient-to-r ${currentHero.primaryButtonColors} rounded-xl text-base font-medium hover:shadow-lg ${currentHero.primaryButtonShadow} transition-all text-white`}
                >
                  {currentHero.primaryButton}
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="px-6 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-base font-medium text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                {currentHero.secondaryButton}
              </motion.button>
            </motion.div>


          </motion.div>

          {/* Right Content - Zoli's Image */}
          <div className="relative hidden lg:block flex items-center justify-end lg:translate-x-20 xl:translate-x-24">
            <motion.div
              key={`image-container-${currentVersion}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isVisible ? 1 : 0.7, 
                scale: isVisible ? 1 : 0.95
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="relative flex items-center justify-center"
            >
               {/* Main circular image with dynamic border */}
               <motion.div 
                 className={`relative w-80 h-80 rounded-full overflow-hidden border-4 shadow-2xl z-10 transition-all duration-700 ${
                   currentVersion === 0 
                     ? 'border-blue-500/30 dark:border-blue-400/20' 
                     : 'border-green-500/30 dark:border-green-400/20'
                 }`}
                 animate={{
                   boxShadow: currentVersion === 0 
                     ? "0 25px 50px -12px rgba(59, 130, 246, 0.25)" 
                     : "0 25px 50px -12px rgba(34, 197, 94, 0.25)"
                 }}
                 transition={{ duration: 0.7 }}
               >
                 <Image
                   src="/zoli/zolypic.jpg"
                   alt="JusTZoly - Gym ring és kontroller a kezében"
                   fill
                   className="object-cover object-center scale-110"
                   priority
                 />
               </motion.div>
               
               {/* Dynamic glow effects that change with content */}
               <motion.div 
                 className={`absolute inset-0 w-80 h-80 rounded-full blur-3xl -z-10 transition-all duration-700 ${
                   currentVersion === 0 
                     ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20' 
                     : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20'
                 }`}
                 animate={{
                   scale: [1, 1.1, 1],
                   opacity: [0.6, 0.8, 0.6]
                 }}
                 transition={{
                   duration: 4,
                   repeat: Infinity,
                   ease: "easeInOut"
                 }}
               />
               
               {/* Floating particles around the image */}
               {[...Array(8)].map((_, i) => {
                 const angle = (i * Math.PI * 2) / 8;
                 const radius = 180; // pixels from center
                 const x = Math.cos(angle) * radius;
                 const y = Math.sin(angle) * radius;
                 
                 return (
                   <motion.div
                     key={`particle-${i}-${currentVersion}`}
                     className={`absolute w-2 h-2 rounded-full ${
                       currentVersion === 0 ? 'bg-blue-400/60' : 'bg-green-400/60'
                     }`}
                     style={{
                       left: '50%',
                       top: '50%',
                       marginLeft: `${x}px`,
                       marginTop: `${y}px`,
                       transform: 'translate(-50%, -50%)'
                     }}
                     animate={{
                       scale: [0.5, 1.2, 0.5],
                       opacity: [0.3, 0.8, 0.3],
                     }}
                     transition={{
                       duration: 3 + i * 0.2,
                       repeat: Infinity,
                       ease: "easeInOut",
                       delay: i * 0.3
                     }}
                   />
                 );
               })}
               
               {/* Dynamic rotating rings */}
               <motion.div
                 animate={{ rotate: 360 }}
                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 className={`absolute inset-0 w-80 h-80 border-2 border-dashed rounded-full -z-5 transition-colors duration-700 ${
                   currentVersion === 0 
                     ? 'border-blue-500/30 dark:border-blue-500/20' 
                     : 'border-green-500/30 dark:border-green-500/20'
                 }`}
               />
               <motion.div
                 animate={{ rotate: -360 }}
                 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                 className={`absolute inset-2 w-72 h-72 border rounded-full -z-5 transition-colors duration-700 ${
                   currentVersion === 0 
                     ? 'border-purple-500/20 dark:border-purple-500/10' 
                     : 'border-emerald-500/20 dark:border-emerald-500/10'
                 }`}
               />
               
               {/* Pulsing outer ring */}
               <motion.div
                 className={`absolute -inset-4 w-96 h-96 border rounded-full -z-10 transition-colors duration-700 ${
                   currentVersion === 0 
                     ? 'border-blue-400/10' 
                     : 'border-green-400/10'
                 }`}
                 animate={{
                   scale: [1, 1.05, 1],
                   opacity: [0.3, 0.6, 0.3]
                 }}
                 transition={{
                   duration: 6,
                   repeat: Infinity,
                   ease: "easeInOut"
                 }}
               />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 