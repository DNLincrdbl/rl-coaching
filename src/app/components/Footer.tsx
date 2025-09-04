'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaDiscord, FaSteam, FaYoutube, FaTwitch, FaInstagram } from 'react-icons/fa';

const socialLinks = [
  { icon: FaYoutube, href: '#', label: 'YouTube' },
  { icon: FaTwitch, href: '#', label: 'Twitch' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaSteam, href: '#', label: 'Steam' },
  { icon: FaDiscord, href: '#', label: 'Discord' }
];

const footerLinks = [
  { name: 'Digitális termékek', href: '#shop' },
  { name: 'Rólam', href: '#about' },
  { name: 'Egészség', href: '#health' },
  { name: 'Kapcsolat', href: '#contact' }
];

export default function Footer() {
  return (
    <footer className="relative pt-32 pb-16">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-white/20 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main footer content */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-24 mb-16">
            {/* Left column */}
            <div>
              <Link 
                href="/"
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text inline-block mb-6"
              >
                JusTZoly
              </Link>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              Professzionális Rocket League coaching szolgáltatás, részletes visszajelzésekkel.
              </p>
              <div className="flex space-x-6">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-6 h-6" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-gray-900 dark:text-white font-medium mb-4">Navigáció</h3>
                <ul className="space-y-3">
                  {footerLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white font-medium mb-4">Elérhetőség</h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li>Discord: JusTZoly#0000</li>
                  <li>contact@example.com</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer bottom */}
          <div className="pt-8 border-t border-gray-200/50 dark:border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © {new Date().getFullYear()} JusTZoly. Minden jog fenntartva.
              </p>
              <div className="flex space-x-6 text-sm">
                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Adatvédelem
                </Link>
                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Felhasználási feltételek
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 