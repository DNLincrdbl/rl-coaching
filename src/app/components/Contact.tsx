'use client';

import { motion } from 'framer-motion';
import { FaDiscord, FaEnvelope, FaInstagram } from 'react-icons/fa';

const contactMethods = [
  {
    id: 'discord',
    name: 'Discord',
    icon: FaDiscord,
    link: '#',
    color: 'from-[#5865F2] to-[#4752C4]',
    description: 'Csatlakozz a Discord szerveremhez'
  },
  {
    id: 'email',
    name: 'E-mail',
    icon: FaEnvelope,
    link: 'mailto:contact@example.com',
    color: 'from-orange-500 to-red-500',
    description: 'Írj nekem e-mailt'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: FaInstagram,
    link: '#',
    color: 'from-pink-500 to-rose-500',
    description: 'Kövess Instagramon'
  }
];

export default function Contact() {
  return (
    <section id="contact" className="py-32 relative bg-[#0A0F1C]">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[120px]"
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-purple-500/10 border border-purple-500/20 text-purple-400 backdrop-blur-sm"
            >
              📬 Lépj kapcsolatba
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mt-6 text-white">
              Kezdjük el a közös{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                munkát
              </span>
            </h2>
            <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto">
              Válaszd ki a számodra legkényelmesebb kapcsolatfelvételi módot.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <motion.a
                key={method.id}
                href={method.link}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all group overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{method.name}</h3>
                  <p className="text-sm text-gray-400">{method.description}</p>
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
            <p className="text-gray-500">
              Általában <span className="text-white font-medium">24 órán belül</span> válaszolok
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}