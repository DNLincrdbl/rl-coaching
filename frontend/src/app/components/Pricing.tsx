'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';
import { parseHuf } from '@/lib/data/products';

interface Tier {
  id: string;
  index: string;
  name: string;
  price: string;
  period: string;
  highlight?: boolean;
  features: { text: string; included: boolean }[];
  cta: string;
}

const TIERS: Tier[] = [
  {
    id: 'rlm',
    index: '01',
    name: 'RLM',
    price: '1.990',
    period: 'Ft / hó',
    features: [
      { text: 'Teljes kurzus- és tutoriál-hozzáférés', included: true },
      { text: 'Aréna Tree (Dribble & Aerial)', included: true },
      { text: 'Leaderboard (20 tagnál nyílik)', included: true },
      { text: 'Hibajelentés', included: true },
      { text: 'Havi replay elemzés', included: false },
    ],
    cta: 'RLM választása',
  },
  {
    id: 'rlm_plus',
    index: '02',
    name: 'RLM+',
    price: '7.990',
    period: 'Ft / hó',
    highlight: true,
    features: [
      { text: 'Minden az RLM-ből', included: true },
      { text: 'Havi 1 személyre szabott replay elemzés', included: true },
      { text: 'RLM+ Replay Elemzések (publikus / privát)', included: true },
      { text: 'Extra replay kredit 5.990 Ft-ért', included: true },
      { text: 'Discord egyeztetés a replay elemzéshez', included: true },
    ],
    cta: 'RLM+ választása',
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
    <section id="pricing" className="pt-24 md:pt-36">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.32em] text-white/40">Tagság</p>
          <h2 className="max-w-4xl text-[clamp(3rem,8vw,7rem)] font-black leading-[0.86] tracking-[-0.05em] text-white">
            Válaszd ki
            <br />
            a tagságod.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/50 md:text-lg">
            Kezdd az RLM-mel, vagy lépj RLM+-ra havi replay elemzéssel.
          </p>
        </motion.div>
      </div>

      <div className="mt-14 border-t border-white/15 md:mt-20">
        {TIERS.map((tier) => (
          <article
            key={tier.id}
            className="group border-b border-white/15 transition-colors duration-300 md:hover:bg-white"
          >
            <div className="mx-auto grid max-w-6xl items-end gap-8 px-4 py-10 md:grid-cols-12 md:px-8 md:py-14">
              <div className="md:col-span-5">
                <div className="flex items-center gap-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/40 group-hover:text-black/45">{tier.index}</p>
                  {tier.highlight && (
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-black group-hover:bg-black group-hover:text-white">
                      Legnépszerűbb
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-[clamp(3.5rem,7vw,6.5rem)] font-black leading-[0.85] tracking-[-0.05em] text-white group-hover:text-black">
                  {tier.name}
                </h3>
                <p className="mt-4 flex items-end gap-2 text-white group-hover:text-black">
                  <span className="text-4xl font-black tracking-tight md:text-5xl">{tier.price}</span>
                  <span className="mb-1 text-sm text-white/45 group-hover:text-black/50">{tier.period}</span>
                </p>
              </div>

              <ul className="space-y-2.5 md:col-span-4">
                {tier.features.map((f) => (
                  <li
                    key={f.text}
                    className={`flex items-start gap-3 text-sm leading-snug ${
                      f.included
                        ? 'text-white/80 group-hover:text-black/80'
                        : 'text-white/30 line-through group-hover:text-black/30'
                    }`}
                  >
                    <FaCheck className={`mt-1 h-2.5 w-2.5 shrink-0 ${f.included ? 'text-white group-hover:text-black' : 'text-white/25 group-hover:text-black/25'}`} />
                    {f.text}
                  </li>
                ))}
              </ul>

              <div className="md:col-span-3 md:justify-self-end">
                <button
                  type="button"
                  onClick={() => addTier(tier)}
                  className="w-full rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition group-hover:bg-black group-hover:text-white md:w-auto"
                >
                  {tier.cta}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mx-auto max-w-6xl px-4 py-8 text-sm text-white/40 md:px-8">
        RLM+ tagoknak: extra replay elemzés bármikor megvásárolható <span className="text-white/70">5.990 Ft</span> áron, a kreditek gyűlnek.
      </p>
    </section>
  );
}
