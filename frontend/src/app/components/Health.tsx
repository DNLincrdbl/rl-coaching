'use client';

import { motion } from 'framer-motion';
import BeforeAfterSlider from './BeforeAfterSlider';

export default function Health() {
  return (
    <section id="health" className="pt-24 md:pt-40">
      <div className="grid lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-end px-4 py-16 md:px-10 lg:py-24 lg:pl-16"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/40">Egészséges életmód</p>
          <h2 className="mt-4 text-[clamp(3.4rem,7vw,6.4rem)] font-black leading-[0.86] tracking-[-0.05em] text-white">
            A játék
            <br />
            és az <span className="text-stroke">egészség.</span>
          </h2>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-white/60">
            Egészségesebb légkörré próbálom tenni a gaminget, azzal hogy segítek átvenni az irányítást nem csak a játék, hanem az egészség felett.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
          className="relative h-[70vh] lg:h-screen"
        >
          <BeforeAfterSlider />
        </motion.div>
      </div>

      <dl className="grid grid-cols-2 border-t border-white/15">
        <div className="border-r border-white/15 px-4 py-8 md:px-10 md:py-12">
          <dt className="text-[11px] uppercase tracking-[0.28em] text-white/40">Gyakorlat</dt>
          <dd className="mt-2 text-[clamp(3.5rem,8vw,7rem)] font-black leading-none tracking-[-0.05em] text-white">50+</dd>
        </div>
        <div className="px-4 py-8 md:px-10 md:py-12">
          <dt className="text-[11px] uppercase tracking-[0.28em] text-white/40">Otthon végezhető</dt>
          <dd className="mt-2 text-[clamp(3.5rem,8vw,7rem)] font-black leading-none tracking-[-0.05em] text-white">100%</dd>
        </div>
      </dl>
    </section>
  );
}
