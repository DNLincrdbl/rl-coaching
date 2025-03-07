'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaTrophy, FaChartLine, FaUsers } from 'react-icons/fa';

const achievements = [
  {
    icon: FaTrophy,
    title: "Grand Champion",
    description: "Több szezonon keresztül",
    color: "text-red-400",
    bgColor: "bg-red-400/10"
  },
  {
    icon: FaChartLine,
    title: "5+ év tapasztalat",
    description: "Folyamatos fejlődés",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10"
  },
  {
    icon: FaUsers,
    title: "100+ tanuló",
    description: "Elégedett játékosok",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10"
  }
];

export default function About() {
  return (
    <section id="about" className="py-32 relative">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
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
              className="text-blue-400 font-medium tracking-wider uppercase text-sm mb-4 block"
            >
              Ismerd meg az oktatód
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              Rólam
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="/profile.jpg"
                  alt="JusTZoly"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-transparent to-transparent opacity-60" />
              </div>
              
              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-8 -right-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-xl"
              >
                <div className="text-3xl font-bold text-blue-400">2000+</div>
                <div className="text-sm text-gray-400">Játszott óra</div>
              </motion.div>
            </motion.div>
            
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
                <p className="text-gray-400 leading-relaxed text-lg">
                  Szia! JusTZoly vagyok, és több mint 5 éve élek-halok a Rocket League-ért. 
                  Grand Champion rangom mellett a legnagyobb szenvedélyem az, hogy másoknak 
                  átadjam a tudásom.
                </p>
                <p className="text-gray-400 leading-relaxed text-lg">
                  Eddigi tapasztalataim során számos játékosnak segítettem fejlődni, 
                  a bronz rangtól egészen a champion szintig. Személyre szabott 
                  edzéstervekkel és részletes visszajelzésekkel garantálom a fejlődésed.
                </p>
              </div>

              {/* Achievements */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className={`${achievement.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-1">{achievement.title}</h4>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 