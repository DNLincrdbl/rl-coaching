'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function About() {
  return (
    <section id="about" className="py-32 relative">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-100/50 dark:via-blue-500/5 to-transparent" />
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'white' : 'gray'} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4">
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
              className="text-blue-600 dark:text-blue-400 font-medium tracking-wider uppercase text-sm mb-4 block"
            >
              Ismerd meg az oktatód
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent">
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
              <div className="relative rounded-3xl bg-white/70 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 shadow-xl backdrop-blur">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                  <Image
                    src="/zoli/zoli2.png"
                    alt="JusTZoly - portré"
                    fill
                    className="object-contain object-center"
                    priority
                  />
                </div>
                {/* subtle bottom glow */}
                <div className="absolute -inset-x-2 -bottom-2 h-6 bg-gradient-to-t from-blue-500/15 to-transparent blur-md" />
              </div>
              
              {/* Fennec preset below */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 rounded-2xl bg-gray-100/80 dark:bg-white/5 backdrop-blur-lg border border-gray-200/50 dark:border-white/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">F</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Main Fennec Preset</h4>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>Primary: <span className="font-medium">Orange</span></div>
                  <div>Accent: <span className="font-medium">Blue</span></div>
                  <div>Wheels: <span className="font-medium">Dieci</span></div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right - Story */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                  Grand Champion Oktató
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  15 évesen kezdtem el játszani a Rocket League-el és már az elején láttam, hogy nincs ehhez a játékhoz hasonló. Beszippantott. Minden szabadidőmet erre fordítottam. Élveztem a kihívást amit nyújtott és azt, hogy hónapról hónapra egyre jobb vagyok.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  Sok-sok év és elszánt gyakorlás után elértem a legmagasabb rangot a játékban. Ez az időszak egy fontos dologra tanított meg: <strong>A konzisztens, kemény munkának látszódni fog az eredménye.</strong> Viszont nem mindig volt ez egyszerű. Számtalan nehézséggel küzdöttem meg az utam során, ennek hatására pedig létrehoztam egy programot, ami megkönnyíti a fejlődésed: <Link href="/shop" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Rocket League Mesterfokon</Link>.
                </p>
              </div>

              {/* Experience badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-3 px-6 py-3 bg-blue-100 dark:bg-blue-500/10 rounded-full border border-blue-200/50 dark:border-blue-500/20"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">10+</span>
                </div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Év tapasztalat</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 