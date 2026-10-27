'use client';

import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const StatementBall = dynamic(() => import('./StatementBall'), { ssr: false });

const MARQUEE = ['Kurzusok', 'Aréna', 'Replay elemzés', 'Heti küldetések', 'Leaderboard', 'RLM+'];

const STATEMENT = 'Légy erős és egészséges gamer. Kombináld a gaming szenvedélyt az egészséges életmóddal.';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);

  useEffect(() => {
    const video = videoRef.current;
    const hero = heroRef.current;
    if (!video || !hero) return;
    video.muted = true;
    video.preload = 'metadata';
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const play = video.play();
        if (play) play.catch(() => {});
      } else {
        video.pause();
      }
    }, { rootMargin: '120px' });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <section ref={heroRef} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-black">
        <motion.div style={{ y: videoY }} className="absolute -inset-x-0 -top-[8%] h-[120%]">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src="/fennec_hero_video.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/25" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/15 to-transparent" />

        <motion.div
          style={{ y: copyY, opacity: copyOpacity }}
          className="relative z-10 flex h-full flex-col justify-end px-4 pb-10 pt-28 md:px-8 md:pb-14"
        >
          <div className="mx-auto w-full max-w-6xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mb-6 flex items-center text-[11px] font-medium uppercase tracking-[0.32em] text-white/75"
            >
              <span className="mr-3 inline-block h-1.5 w-1.5 rounded-full bg-[#FF6A2B]" />
              Professzionális Rocket League Coaching
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="max-w-5xl text-[clamp(3.3rem,9vw,8.25rem)] font-black leading-[0.86] tracking-[-0.045em] text-white"
            >
              Emelkedj ki
              <br />
              a <span className="text-stroke">játékosok</span>
              <br />
              közül.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-8 max-w-md lg:mt-10"
            >
              <p className="text-base leading-relaxed text-white/70 md:text-lg">
                Profi útmutatással és gyakorlati tippekkel segítek elérni a következő szintet a Rocket League-ben.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="#pricing"
                  className="inline-flex items-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  Kezdjük el
                </Link>
                <Link
                  href="#about"
                  className="inline-flex items-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/70"
                >
                  Tudj meg többet
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </section>

      <div className="overflow-hidden border-y border-white/10">
        <div className="rlm-marquee-track flex w-max py-4">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center">
              {MARQUEE.map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="flex items-center px-5 text-[12px] font-medium uppercase tracking-[0.32em] text-white/70"
                >
                  {item}
                  <span className="ml-8 text-[#FF6A2B]">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Statement />
    </div>
  );
}

function Statement() {
  const trackRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const words = STATEMENT.split(' ');

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyReduced = () => setReduceMotion(media.matches);
    applyReduced();

    let frame = 0;
    const update = () => {
      frame = 0;
      const track = trackRef.current;
      if (!track || media.matches) {
        progress.set(1);
        return;
      }
      const rect = track.getBoundingClientRect();
      const view = window.innerHeight;
      const distance = Math.max(1, track.offsetHeight - view);
      const passed = Math.min(distance, Math.max(0, -rect.top));
      progress.set(passed / distance);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    media.addEventListener('change', applyReduced);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      media.removeEventListener('change', applyReduced);
    };
  }, [progress]);

  return (
    <div ref={trackRef} className={reduceMotion ? 'bg-black' : 'relative h-[200vh] bg-black'}>
      <section
        className={
          reduceMotion
            ? 'rlm-glow rlm-glow-right relative overflow-hidden bg-black px-4 py-28 md:px-8 md:py-40'
            : 'rlm-glow rlm-glow-right sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden bg-black px-4 md:px-8'
        }
      >
        <StatementBall progress={progress} still={reduceMotion} />
        <div className="relative z-10 mx-auto w-full max-w-6xl md:pr-64 lg:pr-72">
          <p className="mb-8 text-[11px] font-medium uppercase tracking-[0.32em] text-white/40">
            Egészséges gaming
          </p>
          <p className="flex max-w-5xl flex-wrap gap-x-[0.28em] text-[clamp(2.4rem,6.6vw,5.8rem)] font-black leading-[0.92] tracking-[-0.045em]">
            {words.map((word, i) => (
              <RevealWord
                key={`${word}-${i}`}
                word={word}
                index={i}
                total={words.length}
                progress={progress}
                lit={reduceMotion}
              />
            ))}
          </p>
          <p className="mt-10 max-w-xl text-base leading-relaxed text-white/50 md:text-lg">
            Építsd fel az erős tested, miközben fejlődsz a játékban.
          </p>
        </div>
      </section>
    </div>
  );
}

function RevealWord({
  word,
  index,
  total,
  progress,
  lit,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  lit: boolean;
}) {
  const revealEnd = 0.82;
  const span = revealEnd / total;
  const start = index * span;
  const end = start + span;
  const opacity = useTransform(progress, [start, end], [0.16, 1]);
  return (
    <motion.span style={lit ? undefined : { opacity }} className="text-white">
      {word}
    </motion.span>
  );
}
