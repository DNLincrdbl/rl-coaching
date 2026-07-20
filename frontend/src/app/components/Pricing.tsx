'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaRocket, FaCrown, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';
import { parseHuf } from '@/lib/data/products';

interface Tier {
  id: string;
  name: string;
  price: string;
  period: string;
  highlight?: boolean;
  icon: React.ElementType;
  features: { text: string; included: boolean }[];
  cta: string;
}

const TIERS: Tier[] = [
  {
    id: 'basic',
    name: 'Alap tagság',
    price: '1.990',
    period: 'Ft / hó',
    icon: FaRocket,
    features: [
      { text: 'Teljes kurzus- és tutoriál-hozzáférés', included: true },
      { text: 'Aréna Tree (Dribble & Aerial)', included: true },
      { text: 'Leaderboard részvétel', included: true },
      { text: 'Coaching / replay elemzés', included: false },
    ],
    cta: 'Alap választása',
  },
  {
    id: 'pro',
    name: 'Rocket League Mesterfokon',
    price: '7.990',
    period: 'Ft / hó',
    highlight: true,
    icon: FaCrown,
    features: [
      { text: 'Minden az Alap tagságból', included: true },
      { text: 'Havi 1 személyre szabott coaching', included: true },
      { text: 'Részletes replay elemzés (sheet)', included: true },
      { text: 'Discord egyeztetés a coaching alatt', included: true },
    ],
    cta: 'PRO választása',
  },
];

export default function Pricing() {
  const { addItem } = useCart();

  const addTier = (tier: Tier) => {
    addItem({
      id: `sub-${tier.id}`,
      name: tier.name,
      price: parseHuf(tier.price),
      type: 'subscription',
      priceSuffix: '/ hó',
    });
  };

  return (
    <section id="pricing" className="relative py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-white mb-3"
          >
            Válaszd ki a <span className="rlm-gradient-text">tagságod</span>
          </motion.h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Kezdd az alapokkal, vagy vágj bele a teljes mesterképzésbe személyes coachinggal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rlm-card p-8 ${tier.highlight ? 'border-orange-500/40 shadow-2xl shadow-orange-500/10' : ''}`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rlm-btn-primary px-4 py-1 text-xs font-bold">
                  Legnépszerűbb
                </span>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${tier.highlight ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-white/10'}`}>
                  <tier.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{tier.name}</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">{tier.price}</span>
                <span className="text-gray-400 ml-2">{tier.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((f, idx) => (
                  <li key={idx} className={`flex items-center gap-3 ${f.included ? 'text-gray-200' : 'text-gray-600 line-through'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${f.included ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-600'}`}>
                      <FaCheck className="w-2.5 h-2.5" />
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => addTier(tier)}
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${tier.highlight ? 'rlm-btn-primary' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <FaShoppingCart className="w-4 h-4" /> {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          PRO tagoknak: extra replay elemzés bármikor megvásárolható <span className="text-gray-300 font-medium">4.990 Ft</span> áron, ha nem szeretnél a havi körre várni.
        </p>
      </div>
    </section>
  );
}
