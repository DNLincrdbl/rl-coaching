'use client';

import { motion } from 'framer-motion';
import BeforeAfterSlider from './BeforeAfterSlider';

export default function Health() {
  return (
    <section id="health" className="py-32 relative bg-[#0A0F1C]">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 -right-40 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.12, 0.08] }}
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
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-500/10 border border-green-500/20 text-green-400 backdrop-blur-sm"
            >
              💪 Egészséges életmód
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mt-6 text-white">
              A Játék és Az{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text">
                Egészség
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Story */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-gray-400 leading-relaxed text-xl">
                Egészségesebb légkörré próbálom tenni a gaminget, azzal hogy segítek átvenni az irányítást nem csak a játék, hanem az egészség felett.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-2xl font-bold text-green-400">50+</p>
                  <p className="text-sm text-gray-500">Gyakorlat</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-2xl font-bold text-green-400">100%</p>
                  <p className="text-sm text-gray-500">Otthon végezhető</p>
                </div>
              </div>
            </motion.div>
            
            {/* Right - Before/After Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-[4/3] w-full h-full rounded-2xl overflow-hidden border border-white/10">
                <BeforeAfterSlider />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
