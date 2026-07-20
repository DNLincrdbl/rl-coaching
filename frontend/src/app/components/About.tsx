'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function About() {
  return (
    <section id="about" className="py-32 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 -left-40 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]"
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400 backdrop-blur-sm"
            >
              👤 Ismerj meg jobban
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mt-6 text-white">
              Rólam
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left - Image with Fennec preset */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm overflow-hidden">
                <div className="relative aspect-[4/5] bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                  <Image
                    src="/zoli/zoli2.png"
                    alt="JusTZoly - portré"
                    fill
                    className="object-contain object-center"
                    priority
                  />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent pointer-events-none" />
              </div>
              
            </motion.div>
            
            {/* Right - Story */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 text-transparent bg-clip-text">
                  Supersonic Legend Oktató
                </h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  15 évesen kezdtem el játszani a Rocket League-el és már az elején láttam, hogy nincs ehhez a játékhoz hasonló. Beszippantott. Minden szabadidőmet erre fordítottam. Élveztem a kihívást amit nyújtott és azt, hogy hónapról hónapra egyre jobb vagyok.
                </p>
                <p className="text-gray-400 leading-relaxed text-lg">
                  Sok-sok év és elszánt gyakorlás után elértem a legmagasabb rangot a játékban. Ez az időszak egy fontos dologra tanított meg: <strong className="text-white">A konzisztens, kemény munkának látszódni fog az eredménye.</strong> Viszont nem mindig volt ez egyszerű. Számtalan nehézséggel küzdöttem meg az utam során, ennek hatására pedig létrehoztam egy programot, ami megkönnyíti a fejlődésed: <Link href="#shop" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">Rocket League Mesterfokon</Link>.
                </p>
              </div>

              {/* Experience badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-3 px-6 py-3 bg-orange-500/10 rounded-xl border border-orange-500/20"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">10+</span>
                </div>
                <span className="text-orange-300 font-medium">Év tapasztalat</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 