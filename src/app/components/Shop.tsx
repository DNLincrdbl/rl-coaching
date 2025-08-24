'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
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
    icon: '/icons/Ikon Közös Játék.jpg',
    color: 'from-green-500 to-blue-500',
    isPremium: false,
    features: ['Gyakorlati tapasztalat', 'Valós idejű tanácsok', 'Csapatmunka', 'Stratégiai fejlődés']
  },
  {
    id: 'replay',
    name: 'Replay Elemzés',
    description: 'Részletes játék elemzés videóval',
    price: 'Elemzésenként',
    icon: '/icons/Ikon Replay Elemzés.jpg',
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
  const [activeTab, setActiveTab] = useState('rlm');

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
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rocketLeagueServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-2xl backdrop-blur-lg border transition-all duration-300 ease-out cursor-pointer group hover:scale-105 hover:-translate-y-1 hover:shadow-xl ${
                    service.isPremium 
                      ? 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/50 dark:border-orange-500/20 hover:border-orange-300/50'
                      : 'bg-white/10 dark:bg-white/5 border-gray-200/50 dark:border-white/10 hover:border-gray-300/50'
                  }`}
                  onClick={() => setActiveTab(service.id)}
                >
                  {service.isPremium && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Premium
                    </div>
                  )}
                  
                  <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 mx-auto border-2 border-gray-200/50 dark:border-white/10">
                    <Image
                      src={service.icon}
                      alt={service.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    {service.name}
                  </h4>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center">
                    {service.description}
                  </p>
                  
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                      {service.price}
                    </span>
                  </div>
                  
                  <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
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
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {otherServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl backdrop-blur-lg border border-gray-200/50 dark:border-white/10 hover:border-gray-300/50 transition-all cursor-pointer group hover:scale-105"
                  onClick={() => setActiveTab(service.id)}
                >
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center mb-4 mx-auto`}>
                    <service.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    {service.name}
                  </h4>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center">
                    {service.description}
                  </p>
                  
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
                      {service.price}
                    </span>
                  </div>
                  
                  <button className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all">
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
