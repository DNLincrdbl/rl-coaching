'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const MARQUEE = ['Kurzusok', 'Aréna', 'Replay elemzés', 'Heti küldetések', 'Leaderboard', 'RLM+'];
const REVEAL = [0.76, 0, 0.24, 1] as const;
const EASE = [0.22, 1, 0.36, 1] as const;

type StageShellProps = {
  open: boolean;
  onClose: () => void;
  z?: number;
  label: string;
  title: string;
  subtitle?: string;
  ghost: string;
  children: ReactNode;
};

function SideVideo({ className }: { className: string }) {
  return (
    <div className={className}>
      <video
        className="h-full w-full object-cover"
        src="/fennec_hero_video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30 lg:bg-gradient-to-r lg:from-black lg:via-black/25 lg:to-transparent" />
    </div>
  );
}

export default function StageShell({
  open,
  onClose,
  z = 240,
  label,
  title,
  subtitle,
  ghost,
  children,
}: StageShellProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const entered = useRef(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  useEffect(() => {
    if (!open) {
      entered.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      entered.current = true;
    }, 1000);
    return () => window.clearTimeout(id);
  }, [open]);

  if (!mounted) return null;

  const titleDelay = entered.current ? 0.02 : 0.34;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, delay: 0.2, ease: EASE } }}
          className="fixed inset-0 flex flex-col bg-black lg:grid lg:grid-cols-2"
          style={{ zIndex: z }}
        >
          <motion.button
            type="button"
            onClick={onClose}
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: reduced ? 0 : 0.55, ease: EASE }}
            className="absolute right-4 top-4 z-30 rounded-full border border-white/25 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/80 transition hover:border-white hover:text-white"
          >
            Bezár
          </motion.button>

          <motion.div
            className="relative h-44 shrink-0 overflow-hidden lg:hidden"
            initial={reduced ? false : { clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={reduced ? undefined : { clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.85, ease: REVEAL }}
          >
            <motion.div
              className="h-full w-full"
              initial={reduced ? false : { scale: 1.12 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.25, ease: EASE }}
            >
              <SideVideo className="relative h-full w-full overflow-hidden" />
            </motion.div>
          </motion.div>

          <motion.div
            className="rlm-glow rlm-glow-right relative flex min-h-0 flex-1 flex-col bg-black"
            initial={reduced ? false : { clipPath: 'inset(100% 0 0 0)' }}
            animate={{ clipPath: 'inset(0% 0 0 0)' }}
            exit={reduced ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: reduced ? 0.2 : 0.95, ease: REVEAL }}
          >
            <div className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-10 pt-16 md:px-12 md:pt-20">
              <motion.p
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: reduced ? 0 : 0.28, ease: EASE }}
                className="relative z-10 text-[11px] font-medium uppercase tracking-[0.32em] text-white/40"
              >
                {label}
              </motion.p>
              <div className="relative mt-3 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={ghost}
                    aria-hidden
                    initial={reduced ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 0.2, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.7, delay: titleDelay, ease: EASE }}
                    className="text-stroke pointer-events-none absolute -left-1 -top-3 select-none text-[clamp(4.2rem,11vw,8rem)] font-black leading-none tracking-[-0.06em]"
                  >
                    {ghost}
                  </motion.p>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.h2
                    id={titleId}
                    key={title}
                    initial={reduced ? false : { y: '115%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '-110%' }}
                    transition={{ duration: 0.85, delay: titleDelay, ease: EASE }}
                    className="relative z-10 max-w-[12ch] text-[clamp(2.8rem,5.6vw,4.8rem)] font-black leading-[0.86] tracking-[-0.055em] text-white"
                  >
                    {title}
                  </motion.h2>
                </AnimatePresence>
              </div>
              {subtitle && (
                <motion.p
                  key={subtitle}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: reduced ? 0 : titleDelay + 0.12, ease: EASE }}
                  className="relative z-10 mt-5 max-w-md text-base leading-relaxed text-white/55 md:text-lg"
                >
                  {subtitle}
                </motion.p>
              )}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: reduced ? 0 : 0.48, ease: EASE }}
                className="relative z-10 mt-10"
              >
                {children}
              </motion.div>
            </div>

            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: reduced ? 0 : 0.7 }}
              className="overflow-hidden border-t border-white/10"
            >
              <div className="rlm-marquee-track flex w-max py-3">
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex items-center">
                    {MARQUEE.map((word) => (
                      <span
                        key={`${copy}-${word}`}
                        className="flex items-center px-5 text-[11px] font-medium uppercase tracking-[0.32em] text-white/55"
                      >
                        {word}
                        <span className="ml-8 text-[#FF6A2B]">·</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative hidden overflow-hidden lg:block"
            initial={reduced ? false : { clipPath: 'inset(0 0 0 100%)' }}
            animate={{ clipPath: 'inset(0 0 0 0%)' }}
            exit={reduced ? undefined : { clipPath: 'inset(0 0 0 100%)' }}
            transition={{ duration: 1.05, delay: reduced ? 0 : 0.06, ease: REVEAL }}
          >
            <motion.div
              className="h-full w-full"
              initial={reduced ? false : { scale: 1.16 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.45, ease: EASE }}
            >
              <SideVideo className="relative h-full w-full overflow-hidden" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
