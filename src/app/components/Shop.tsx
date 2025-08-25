'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaDumbbell } from 'react-icons/fa';

const rocketLeagueServices = [
  {
    id: 'rlm',
    name: 'Rocket League Mesterfokon',
    description: 'Komplex fejlődési program havi előfizetéssel',
    price: 'Havi előfizetés',
    icon: '/icons/Ikon Rocket League Mesterfokon.jpg',
    color: 'from-orange-500 to-red-500',
    isPremium: true,
    features: ['Személyre szabott edzéstervek', 'Részletes videó elemzések', 'Közösségi támogatás', 'Folyamatos frissítések']
  },
  {
    id: 'coaching',
    name: 'Coaching',
    description: 'Egyéni órák professzionális oktatóval',
    price: 'Óránként',
    icon: '/icons/Ikon Coaching.jpg',
    color: 'from-blue-500 to-purple-500',
    isPremium: false,
    features: ['Személyre szabott feedback', 'Replay elemzés', 'Gyakorlatok', 'Stratégiai tanácsok']
  },
  {
    id: 'play',
    name: 'Közös Játék',
    description: 'Játssz velem és tanulj közben',
    price: 'Óránként',
    icon: '/icons/icon_play_together.jpg',
    color: 'from-green-500 to-blue-500',
    isPremium: false,
    features: ['Gyakorlati tapasztalat', 'Valós idejű tanácsok', 'Csapatmunka', 'Stratégiai fejlődés']
  },
  {
    id: 'replay',
    name: 'Replay Elemzés',
    description: 'Részletes játék elemzés videóval',
    price: 'Elemzésenként',
    icon: '/icons/icon_elemzes.jpg',
    color: 'from-purple-500 to-pink-500',
    isPremium: false,
    features: ['Videó elemzés', 'Írásbeli feedback', 'Fejlődési javaslatok', 'Gyakorlatok']
  }
];

const otherServices = [
  {
    id: 'bodyweight',
    name: 'A JusTZoly Testsúly Program',
    description: 'Otthoni edzés program egészséges gamer élethez',
    price: 'Egyszeri vásárlás',
    icon: FaDumbbell,
    color: 'from-green-500 to-teal-500',
    isPremium: false,
    features: ['Otthoni edzések', 'Táplálkozási tanácsok', 'Gaming-egészség egyensúly', 'Fokozatos fejlődés']
  }
];

export default function Shop() {
  const isSingleOther = otherServices.length === 1;

  return (
    <section id="shop" className="py-32 relative">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-100/50 dark:via-indigo-500/5 to-transparent" />
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
              className="text-indigo-600 dark:text-indigo-400 font-medium tracking-wider uppercase text-sm mb-4 block"
            >
              Szolgáltatásaim
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent">
              Digitális Termékek
            </h2>
          </div>

          {/* Rocket League Services */}
          <div className="mb-16">
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-8 text-center"
            >
              Rocket League
            </motion.h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {rocketLeagueServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-8 rounded-2xl backdrop-blur-lg border transition-transform duration-600 ease-in-out cursor-pointer group hover:scale-[1.02] hover:-translate-y-1 flex flex-col h-96 ${
                    service.isPremium 
                      ? 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/50 dark:border-orange-500/20 hover:border-orange-300/50 hover:from-orange-500/20 hover:to-red-500/20'
                      : 'bg-white/10 dark:bg-white/5 border-gray-200/50 dark:border-white/10 hover:border-gray-300/50 hover:bg-white/20 dark:hover:bg-white/10'
                  }`}
                >
                  {service.isPremium && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Premium
                    </div>
                  )}
                  
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mb-6 mx-auto border-2 border-gray-200/50 dark:border-white/10 transition-all duration-500 ease-out group-hover:scale-110 group-hover:border-gray-300/70 dark:group-hover:border-white/30">
                    <Image
                      src={service.icon}
                      alt={service.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                  
                  <h4 className={`font-bold text-gray-900 dark:text-white mb-3 text-center ${
                    service.id === 'rlm' ? 'text-lg' : 'text-xl'
                  }`}>
                    {service.name}
                  </h4>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center flex-grow">
                    {service.description}
                  </p>
                  
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                      {service.price}
                    </span>
                  </div>
                  
                  <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] hover:from-blue-600 hover:to-purple-600 transition-all duration-500 ease-out mt-auto">
                    Részletek
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-white/20 to-transparent mb-16" />

          {/* Other Services */}
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-8 text-center"
            >
              Egyéb
            </motion.h3>
            
            <div className={`${isSingleOther ? 'flex justify-center' : 'grid md:grid-cols-2 lg:grid-cols-3'} gap-8 max-w-4xl mx-auto`}>
              {otherServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-8 rounded-2xl backdrop-blur-lg border border-gray-200/50 dark:border-white/10 hover:border-gray-300/50 transition-transform duration-600 ease-in-out cursor-pointer group hover:scale-[1.02] hover:-translate-y-1 flex flex-col h-96 hover:bg-white/20 dark:hover:bg-white/10"
                >
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center mb-6 mx-auto transition-all duration-500 ease-out group-hover:scale-110 group-hover:shadow-lg`}>
                    <service.icon className="w-12 h-12 text-white transition-all duration-500 ease-out group-hover:scale-110" />
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                    {service.name}
                  </h4>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center flex-grow">
                    {service.description}
                  </p>
                  
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
                      {service.price}
                    </span>
                  </div>
                  
                  <button className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-2xl hover:shadow-green-500/40 hover:scale-[1.02] hover:from-green-600 hover:to-teal-600 transition-all duration-500 ease-out mt-auto">
                    Részletek
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
