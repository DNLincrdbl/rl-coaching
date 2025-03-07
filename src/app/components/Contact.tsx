'use client';

import { motion } from 'framer-motion';
import { FaDiscord, FaEnvelope, FaSteam } from 'react-icons/fa';

const contactMethods = [
  {
    id: 'discord',
    name: 'Discord',
    icon: FaDiscord,
    link: '#',
    color: 'from-[#5865F2] to-[#4752C4]',
    hoverColor: 'hover:shadow-[#5865F2]/25',
    description: 'Csatlakozz a Discord szerveremhez'
  },
  {
    id: 'email',
    name: 'E-mail',
    icon: FaEnvelope,
    link: 'mailto:contact@example.com',
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:shadow-blue-500/25',
    description: 'Írj nekem e-mailt'
  },
  {
    id: 'steam',
    name: 'Steam',
    icon: FaSteam,
    link: '#',
    color: 'from-gray-600 to-gray-700',
    hoverColor: 'hover:shadow-gray-500/25',
    description: 'Kövess Steamen'
  }
];

export default function Contact() {
  return (
    <section id="contact" className="py-32 relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-blue-400 font-medium tracking-wider uppercase text-sm mb-4 block"
            >
              Lépj kapcsolatba
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              Kezdjük el a közös munkát
            </h2>
            <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto">
              Válaszd ki a számodra legkényelmesebb kapcsolatfelvételi módot, és kezdjük el közösen a fejlődésed útját.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <motion.a
                key={method.id}
                href={method.link}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`bg-gradient-to-r ${method.color} p-8 rounded-2xl backdrop-blur-lg hover:shadow-lg ${method.hoverColor} transition-all group`}
              >
                <div className="flex flex-col items-center text-center">
                  <method.icon className="w-12 h-12 mb-4 opacity-90 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-xl font-bold mb-2">{method.name}</h3>
                  <p className="text-sm text-gray-300">{method.description}</p>
                </div>
              </motion.a>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-gray-400">
              Általában <span className="text-white font-medium">24 órán belül</span> válaszolok
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 