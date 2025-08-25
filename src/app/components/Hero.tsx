'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
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
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <motion.div
            variants={contentVariants}
            initial="initial"
            animate="animate"
            className="text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <span className="text-blue-600 dark:text-blue-400 font-medium tracking-wider uppercase text-sm inline-block mb-4 bg-blue-100 dark:bg-blue-500/10 px-4 py-2 rounded-full">
                Professzionális Rocket League Coaching
              </span>
            </motion.div>

            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Emelkedj ki a{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
                játékosok
              </span>{' '}
              közül
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl leading-relaxed">
              Személyre szabott edzéstervvel és profi útmutatással segítek elérni 
              a következő szintet a Rocket League-ben.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#shop">
                <motion.button
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-base font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all text-white"
                >
                  Kezdjük el
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="px-6 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-base font-medium text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Tudj meg többet
              </motion.button>
            </div>


          </motion.div>

          {/* Right Content - Zoli's Image */}
          <div className="relative hidden lg:block flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative flex items-center justify-center"
            >
               {/* Main circular image */}
               <div className="relative w-80 h-80 rounded-full overflow-hidden border-4 border-white/20 dark:border-white/10 shadow-2xl z-10">
                 <Image
                   src="/zoli/zoli.png"
                   alt="JusTZoly - Gym ring és kontroller a kezében"
                   fill
                   className="object-cover object-center scale-110"
                   priority
                 />
               </div>
               
               {/* Decorative glow effects */}
               <div className="absolute inset-0 w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl -z-10" />
               
               {/* Rotating border rings - behind the image */}
               <motion.div
                 animate={{ rotate: 360 }}
                 transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 w-80 h-80 border-2 border-dashed border-blue-500/30 dark:border-blue-500/20 rounded-full -z-5"
               />
               <motion.div
                 animate={{ rotate: -360 }}
                 transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-1 w-72 h-72 border border-purple-500/20 dark:border-purple-500/10 rounded-full -z-5"
               />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 