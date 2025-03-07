'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function About() {
  return (
    <section id="about" className="py-32 relative">
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
              className="text-blue-400 font-medium tracking-wider uppercase text-sm"
            >
              Ismerd meg az oktatód
            </motion.span>
            <h2 className="text-4xl font-bold mt-4">Rólam</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-2xl overflow-hidden"
            >
              <Image
                src="/profile.jpg"
                alt="JusTZoly"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-transparent to-transparent opacity-60" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-blue-400">Grand Champion Oktató</h3>
                <p className="text-gray-400 leading-relaxed">
                  Szia! JusTZoly vagyok, és több mint 5 éve élek-halok a Rocket League-ért. 
                  Grand Champion rangom mellett a legnagyobb szenvedélyem az, hogy másoknak 
                  átadjam a tudásom.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  Eddigi tapasztalataim során számos játékosnak segítettem fejlődni, 
                  a bronz rangtól egészen a champion szintig. Személyre szabott 
                  edzéstervekkel és részletes visszajelzésekkel garantálom a fejlődésed.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div>
                  <div className="text-3xl font-bold text-blue-400">2000+</div>
                  <div className="text-gray-500 mt-1">Játszott óra</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400">100+</div>
                  <div className="text-gray-500 mt-1">Elégedett tanuló</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 