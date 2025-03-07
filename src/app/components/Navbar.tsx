'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <nav className="fixed w-full z-50 bg-[#0A0F1C]/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text"
          >
            JusTZoly
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="#about" 
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Rólam
            </Link>
            <Link 
              href="#courses" 
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Kurzusok
            </Link>
            <Link 
              href="#contact" 
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Kapcsolat
            </Link>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="ml-8 px-6 py-2.5 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition-all"
            >
              Foglalj időpontot
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 