'use client';

import { FaDiscord, FaEnvelope, FaInstagram } from 'react-icons/fa';

const contactMethods = [
  {
    id: 'discord',
    name: 'Discord',
    icon: FaDiscord,
    link: '#',
    description: 'Csatlakozz a Discord szerveremhez',
  },
  {
    id: 'email',
    name: 'E-mail',
    icon: FaEnvelope,
    link: 'mailto:contact@example.com',
    description: 'Írj nekem e-mailt',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: FaInstagram,
    link: '#',
    description: 'Kövess Instagramon',
  },
];

export default function Contact() {
  return (
    <section id="contact" className="pt-24 md:pt-36">
      <div className="mx-auto max-w-6xl px-4 pb-12 md:px-8 md:pb-16">
        <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.32em] text-white/40">Lépj kapcsolatba</p>
        <h2 className="max-w-5xl text-[clamp(3.2rem,8vw,7rem)] font-black leading-[0.86] tracking-[-0.05em] text-white">
          Kezdjük el
          <br />
          a közös munkát.
        </h2>
        <p className="mt-6 max-w-md text-base text-white/50 md:text-lg">
          Válaszd ki a számodra legkényelmesebb kapcsolatfelvételi módot.
        </p>
      </div>

      <div className="border-t border-white/15">
        {contactMethods.map((method) => (
          <a
            key={method.id}
            href={method.link}
            className="group flex items-end justify-between gap-6 border-b border-white/15 px-4 py-7 transition-colors duration-300 md:px-8 md:py-10 md:hover:bg-white"
          >
            <span className="flex items-center gap-4 md:gap-6">
              <method.icon className="h-6 w-6 shrink-0 text-white/50 transition group-hover:text-black/70 md:h-8 md:w-8" />
              <span className="text-[clamp(2.8rem,8vw,6.5rem)] font-black leading-[0.85] tracking-[-0.05em] text-white transition group-hover:text-black">
                {method.name}
              </span>
            </span>
            <span className="mb-1 hidden max-w-[14rem] text-right text-sm text-white/45 transition group-hover:text-black/55 sm:block">
              {method.description}
            </span>
          </a>
        ))}
      </div>

    </section>
  );
}
