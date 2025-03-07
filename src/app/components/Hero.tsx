'use client';

import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

function FennecModel() {
  const { scene } = useGLTF('/fennec.glb');
  return <primitive object={scene} />;
}

const glowVariants = {
  initial: { opacity: 0.5, scale: 0.8 },
  animate: { 
    opacity: [0.5, 0.8, 0.5],
    scale: [0.8, 1.2, 0.8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Hero() {
  return (
    <div className="relative min-h-[90vh] flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1C] via-[#1a1f2c]/80 to-[#0A0F1C]" />
      
      {/* Animated Glow Effects */}
      <motion.div
        variants={glowVariants}
        initial="initial"
        animate="animate"
        className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
      />
      <motion.div
        variants={glowVariants}
        initial="initial"
        animate="animate"
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"
      />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <span className="text-blue-400 font-medium tracking-wider uppercase text-sm inline-block mb-4 bg-blue-500/10 px-4 py-2 rounded-full">
                Professzionális Rocket League Coaching
              </span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Emelkedj ki a{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
                játékosok
              </span>{' '}
              közül
            </h1>

            <p className="text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
              Személyre szabott edzéstervvel és profi útmutatással segítek elérni 
              a következő szintet a Rocket League-ben.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Kezdjük el
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-lg font-medium hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Tudj meg többet
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="text-3xl font-bold text-blue-400 mb-1">2000+</div>
                <div className="text-sm text-gray-400">Játszott óra</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="text-3xl font-bold text-purple-400 mb-1">100+</div>
                <div className="text-sm text-gray-400">Elégedett tanuló</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="text-3xl font-bold text-blue-400 mb-1">GC</div>
                <div className="text-sm text-gray-400">Rang</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Content - 3D Model */}
          <motion.div
            variants={floatingVariants}
            initial="initial"
            animate="animate"
            className="relative hidden lg:block h-[600px]"
          >
            <div className="absolute inset-0">
              <div className="relative w-full h-full">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    transition: { duration: 20, repeat: Infinity, ease: "linear" }
                  }}
                  className="absolute inset-0 border-2 border-dashed border-blue-500/20 rounded-full"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 rounded-full" />
                
                {/* 3D Model Canvas */}
                <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
                  <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.6}>
                      <FennecModel />
                    </Stage>
                    <OrbitControls 
                      enableZoom={false}
                      autoRotate
                      autoRotateSpeed={4}
                      enablePan={false}
                      minPolarAngle={Math.PI / 2}
                      maxPolarAngle={Math.PI / 2}
                    />
                  </Suspense>
                </Canvas>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 