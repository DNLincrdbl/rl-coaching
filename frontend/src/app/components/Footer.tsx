'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaDiscord, FaSteam, FaYoutube, FaTwitch, FaInstagram } from 'react-icons/fa';

const socialLinks = [
  { icon: FaYoutube, href: '#', label: 'YouTube' },
  { icon: FaTwitch, href: '#', label: 'Twitch' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaSteam, href: '#', label: 'Steam' },
  { icon: FaDiscord, href: '#', label: 'Discord' },
];

const footerLinks = [
  { name: 'Digitális termékek', id: 'shop' },
  { name: 'Rólam', id: 'about' },
  { name: 'Egészség', id: 'health' },
  { name: 'Kapcsolat', id: 'contact' },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Footer() {
  return (
    <footer className="relative pt-24 pb-12 bg-black">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-24 mb-12">
            <div>
              <Link
                href="/"
                className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 text-transparent bg-clip-text inline-block mb-6"
              >
                JusTZoly
              </Link>
              <p className="text-gray-500 mb-8 max-w-md">
                Professzionális Rocket League coaching szolgáltatás, részletes visszajelzésekkel.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:border-orange-500/40 transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-white font-medium mb-4">Navigáció</h3>
                <ul className="space-y-3">
                  {footerLinks.map((link) => (
                    <li key={link.name}>
                      <button
                        type="button"
                        onClick={() => scrollToId(link.id)}
                        className="text-gray-500 hover:text-white transition-colors text-left"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-4">Elérhetőség</h3>
                <ul className="space-y-3 text-gray-500">
                  <li>Discord: JusTZoly#0000</li>
                  <li>
                    <a href="mailto:contact@example.com" className="hover:text-white transition-colors">
                      contact@example.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} JusTZoly. Minden jog fenntartva.
              </p>
              <div className="flex space-x-6 text-sm">
                <Link href="/privacy" className="text-gray-600 hover:text-white transition-colors">
                  Adatvédelem
                </Link>
                <Link href="/terms" className="text-gray-600 hover:text-white transition-colors">
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
