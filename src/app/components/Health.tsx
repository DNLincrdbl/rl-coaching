'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Health() {
  return (
    <section id="health" className="py-32 relative">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-100/50 dark:via-green-500/5 to-transparent" />
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
              className="text-green-600 dark:text-green-400 font-medium tracking-wider uppercase text-sm mb-4 block"
            >
              Egészség és Gaming
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent leading-tight pb-2">
              A Játék és Az Egészség
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left - Story */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 text-transparent bg-clip-text">
                  Az Egészség Felismerése
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  23 évesen úgy éreztem, hogy valami hiányzik. Tükörbe néztem: Törékenynek tűntem, alig volt rajtam izom - Egészségtelen voltam. Sokszor rendeltem gyorséttermekből és alig mozogtam, ezért egyre gyengébb volt a testem. Ennek változnia kellett.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  A következő hónapokban beleástam magam abba, hogyan építhetek egy jobb, erősebb fizikumot. Miután elkezdtem edzeni és odafigyelni arra mit eszek, realizáltam, hogy <strong>a gamelés és az edzés nem is annyira különbözik</strong>. Mindkettőben ugyanaz a dolog fogott meg: A fejlődés.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  Lassan rájöttem, hogy mi effektív és mi nem. Kialakítottam egy rendszert, ami működött számomra, eredményeket hozott, és tudtam magam tartani hozzá. Megakarom mutatni, hogyan lehetsz otthonról te is egészséges és egy magas szintű gamer: <Link href="#shop" className="text-green-600 dark:text-green-400 hover:underline font-semibold">A JusTZoly Testsúly Program</Link>.
                </p>
              </div>

              {/* Key insight */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="p-6 bg-green-100 dark:bg-green-500/10 rounded-2xl border border-green-200/50 dark:border-green-500/20"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">💡</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">A Kulcs Felismerés</h4>
                    <p className="text-green-700 dark:text-green-400">
                      A gaming és az edzés ugyanazt a fejlődési elvet követi: konzisztencia, kihívás, és fokozatos fejlődés.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right - Before/After Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                {/* Placeholder for before/after image */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl border-2 border-dashed border-green-500/30 dark:border-green-500/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-600 dark:text-gray-400">
                      <div className="text-6xl mb-4">📊💪</div>
                      <p className="text-lg font-medium">Before/After Image</p>
                      <p className="text-sm">Fizikai fejlődés eredménye</p>
                    </div>
                  </div>
                </div>
                
                {/* Before/After labels */}
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Előtte
                </div>
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Utána
                </div>
              </div>
              
              {/* Stats below */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-6 grid grid-cols-3 gap-4"
              >
                <div className="text-center p-4 rounded-xl bg-gray-100/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">+15kg</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Izomtömeg</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gray-100/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">-8kg</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Zsír</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gray-100/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">+100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Energia</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
