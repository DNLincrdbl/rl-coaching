'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaDiscord, FaSteam, FaYoutube, FaTwitch, FaInstagram } from 'react-icons/fa';
import RlmLogo from './RlmLogo';

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

function SheetLip() {
  return (
    <svg
      className="block w-full"
      style={{ aspectRatio: "1024 / 88" }}
      viewBox="0 0 1024 88"
      preserveAspectRatio="xMidYMin meet"
      aria-hidden
    >
      <path
        fill="white"
        d="M0 88V46C0 30 14 30 18 30H388C408 30 416 22 428 12C440 4 448 4 456 4H568C576 4 584 4 596 12C608 22 616 30 636 30H1006C1010 30 1024 30 1024 46V88H0Z"
      />
    </svg>
  );
}

export default function Footer() {
  const drawRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = drawRef.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      return;
    }
    video.muted = true;
    video.preload = 'metadata';
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const play = video.play();
        if (play) play.catch(() => {});
      } else {
        video.pause();
      }
    }, { rootMargin: '160px' });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="px-3 pb-3 pt-14 md:px-4 md:pb-4 md:pt-24">
      <div className="text-black">
        <SheetLip />
        <div className="-mt-px rounded-b-[28px] bg-white md:rounded-b-[40px]">
          <div className="mx-auto grid max-w-[1240px] grid-cols-[1fr_auto] items-center gap-x-4 gap-y-8 px-5 py-6 [grid-template-areas:'logo_car'_'content_content'] md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-8 md:px-10 md:py-8 md:[grid-template-areas:'logo_content_car'] lg:gap-x-10">
            <Link href="/" aria-label="RLM" className="w-[9.25rem] [grid-area:logo] sm:w-[14rem] md:w-[16rem] lg:w-[19rem]">
              <RlmLogo height={88} className="!h-auto !w-full brightness-0" />
            </Link>

            <div className="flex flex-col items-center gap-6 [grid-area:content]">
              <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center sm:gap-12">
              <div>
                <h3 className="text-[11px] font-medium uppercase tracking-[0.28em] text-black/40">Navigáció</h3>
                <ul className="mt-4 space-y-2">
                  {footerLinks.map((link) => (
                    <li key={link.name}>
                      <button
                        type="button"
                        onClick={() => scrollToId(link.id)}
                        className="whitespace-nowrap text-left text-base font-black tracking-[-0.03em] text-black transition hover:text-black/50 md:text-lg"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-[11px] font-medium uppercase tracking-[0.28em] text-black/40">Kövess</h3>
                <ul className="mt-4 space-y-2">
                  {socialLinks.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        className="inline-flex items-center gap-2 whitespace-nowrap text-base font-black tracking-[-0.03em] text-black transition hover:text-black/50 md:text-lg"
                      >
                        <social.icon className="h-3.5 w-3.5" />
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 whitespace-nowrap text-sm leading-relaxed text-black/55">
                  Discord: JusTZoly#0000
                  <br />
                  <a href="mailto:contact@example.com" className="underline decoration-black/20 underline-offset-4 transition hover:decoration-black">
                    contact@example.com
                  </a>
                </p>
              </div>
              </div>
              <p className="max-w-sm text-center text-sm leading-relaxed text-black/50">
                Professzionális Rocket League coaching szolgáltatás, részletes visszajelzésekkel.
              </p>
            </div>

            <div className="flex w-[7.5rem] items-center justify-end [grid-area:car] sm:w-[10rem] md:w-[14rem] lg:w-[16.5rem]">
              <video
                ref={drawRef}
                className="h-auto w-full mix-blend-multiply contrast-[1.6]"
                src="/fennec_draw.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-4 text-[11px] uppercase tracking-[0.16em] text-white/45 md:flex-row md:items-center md:justify-between md:px-6">
        <p>© {new Date().getFullYear()} JusTZoly. Minden jog fenntartva.</p>
        <div className="flex gap-5">
          <Link href="/privacy" className="transition hover:text-white">Adatvédelem</Link>
          <Link href="/terms" className="transition hover:text-white">Felhasználási feltételek</Link>
        </div>
      </div>
    </footer>
  );
}
