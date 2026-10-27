'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function About() {
  return (
    <section id="about" className="rlm-glow rlm-glow-aside relative bg-black">
      <p
        aria-hidden
        className="pointer-events-none absolute left-[42%] top-[4%] z-20 hidden -rotate-[7deg] select-none whitespace-nowrap text-[clamp(5rem,10vw,8rem)] leading-none text-[#FF6A2B] lg:block"
        style={{ fontFamily: 'var(--font-signature), cursive' }}
      >
        JusTZoly
      </p>
      <div className="grid lg:grid-cols-2">
        <div className="relative h-[78vh] self-start lg:sticky lg:top-0 lg:h-screen">
          <Image
            src="/zolyportre.png"
            alt="JusTZoly"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="origin-center scale-[0.9] object-contain object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black" />
        </div>

        <div className="relative z-10 flex flex-col justify-end px-4 py-14 md:px-10 lg:pb-24 lg:pr-16 lg:pt-56">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <p
              aria-hidden
              className="pointer-events-none -mb-2 -rotate-[6deg] select-none text-[clamp(4.5rem,18vw,6rem)] leading-none text-[#FF6A2B] lg:hidden"
              style={{ fontFamily: 'var(--font-signature), cursive' }}
            >
              JusTZoly
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/40">Ismerj meg jobban</p>
            <h2 className="mt-4 text-[clamp(4.5rem,10vw,8.5rem)] font-black leading-[0.82] tracking-[-0.055em] text-white">
              Rólam.
            </h2>
            <p className="mt-8 max-w-md text-[clamp(1.6rem,3vw,2.4rem)] font-black leading-[1.05] tracking-tight text-white">
              Supersonic Legend oktató
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-10 max-w-xl space-y-6 text-lg leading-relaxed text-white/60"
          >
            <p>
              15 évesen kezdtem el játszani a Rocket League-el és már az elején láttam, hogy nincs ehhez a játékhoz hasonló. Beszippantott. Minden szabadidőmet erre fordítottam. Élveztem a kihívást amit nyújtott és azt, hogy hónapról hónapra egyre jobb vagyok.
            </p>
            <p>
              Sok-sok év és elszánt gyakorlás után elértem a legmagasabb rangot a játékban. Ez az időszak egy fontos dologra tanított meg:
            </p>
            <p className="border-l-2 border-white pl-5 text-2xl font-black leading-snug tracking-tight text-white md:text-3xl">
              A konzisztens, kemény munkának látszódni fog az eredménye.
            </p>
            <p>
              Viszont nem mindig volt ez egyszerű. Számtalan nehézséggel küzdöttem meg az utam során, ennek hatására pedig létrehoztam egy programot, ami megkönnyíti a fejlődésed:{' '}
              <Link href="#shop" className="font-semibold text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white">
                Rocket League Mesterfokon
              </Link>
              .
            </p>
          </motion.div>

          <div className="mt-12 flex items-end gap-4 border-t border-white/15 pt-6">
            <span className="text-[clamp(4rem,8vw,6.5rem)] font-black leading-none tracking-[-0.05em] text-white">10+</span>
            <span className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45">év tapasztalat</span>
          </div>
        </div>
      </div>
    </section>
  );
}
