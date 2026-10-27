'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaTimes, FaCheck, FaShoppingCart } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { parseHuf } from '@/lib/data/products';

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  fullPrice: string;
  icon: IconType | string;
  image?: string;
  isPremium: boolean;
  features: string[];
  detailedDescription: string;
  benefits: string[];
  duration: string;
}

const rocketLeagueServices: Service[] = [
  {
    id: 'rlm',
    name: 'RLM',
    description: 'Kurzusok, tutoriálok, aréna és heti küldetések — a fejlődés alapja.',
    price: 'Havi előfizetés',
    fullPrice: '1.990 Ft/hó',
    icon: '/icons/Ikon Rocket League Mesterfokon.jpg',
    image: '/kurzus-bronz-plat.jpg',
    isPremium: false,
    features: ['Teljes kurzus-hozzáférés', 'Aréna Tree', 'Heti küldetések', 'Leaderboard'],
    detailedDescription: 'Az RLM csomag a platform magja: kurzusok, tutoriálok, havi aréna fák és heti küldetések. Replay elemzés nélkül, ha még csak gyakorolnál.',
    benefits: ['Kurzusok és tutoriálok', 'Dribble & Aerial aréna', 'Heti küldetések', 'Leaderboard (20 tagnál)', 'Hibajelentés'],
    duration: 'Havi előfizetés, bármikor lemondható',
  },
  {
    id: 'rlm_plus',
    name: 'RLM+',
    description: 'Minden az RLM-ből, plusz havi személyre szabott replay elemzés.',
    price: 'Havi előfizetés',
    fullPrice: '7.990 Ft/hó',
    icon: '/icons/Ikon Coaching.jpg',
    image: '/kurzus-gc2-ssl.jpg',
    isPremium: true,
    features: ['Havi replay elemzés', 'RLM+ feed', 'Discord egyeztetés', 'Extra kredit'],
    detailedDescription: 'RLM+ a teljes program: az RLM minden funkciója, plusz havi 1 személyre szabott replay elemzés videóval. Discordon is egyeztethettek a beküldéskor.',
    benefits: ['Minden az RLM-ből', 'Havi 1 replay elemzés', 'RLM+ Replay Elemzések', 'Discord a beküldéshez', 'Extra replay kredit 5.990 Ft'],
    duration: 'Havi előfizetés, bármikor lemondható',
  },
  {
    id: 'extra-replay',
    name: 'Extra Replay Elemzés',
    description: 'Töltsd fel a replayed — Zoli részletes videós visszajelzést ad.',
    price: 'Elemzésenként',
    fullPrice: '5.990 Ft/elemzés',
    icon: '/icons/icon_elemzes.jpg',
    image: '/kurzus-mentál.jpg',
    isPremium: false,
    features: ['Videó elemzés', 'Írásbeli feedback', 'Gyakorlatok', 'Kredit gyűlik'],
    detailedDescription: 'RLM+ tagoknak extra elemzés, ha a havi kredit elfogyott. A kredit a fiókodon marad, amíg be nem küldöd a replayt.',
    benefits: ['Részletes videó elemzés', 'Írásbeli összefoglaló', 'Konkrét gyakorlatok', 'Hibák azonosítása', 'A kredit nem évül a hónapban'],
    duration: '15–20 perces videó + írásbeli anyag',
  },
];

const otherServices: Service[] = [
  {
    id: 'bodyweight',
    name: 'JusTZoly Edzésprogram',
    description: 'Hozd magad jó formába a saját testsúlyoddal!',
    price: 'Egyszeri vásárlás',
    fullPrice: '12.000 Ft',
    icon: '/edz__sprogram_720.png',
    image: '/edz__sprogram_720.png',
    isPremium: false,
    features: ['Otthoni edzések', 'Táplálkozási tanácsok', 'Gaming-egészség egyensúly', 'Fokozatos fejlődés'],
    detailedDescription: 'Komplett otthoni fitness program gamereknek! Nincs szükség edzőteremre - csak a saját testsúlyoddal dolgozunk. Egészséges gamer életmód kialakítása.',
    benefits: ['50+ gyakorlat videóval', 'Táplálkozási útmutató', 'Gaming szünetek optimalizálása', 'Progresszív edzésterv', 'Életmód tanácsok'],
    duration: 'Élethosszig hozzáférés',
  },
  {
    id: 'cookbook',
    name: 'JusTZoly Receptkönyv',
    description: 'Edd azokat, amiket én, és érd el a célod!',
    price: 'Egyszeri vásárlás',
    fullPrice: '8.000 Ft',
    icon: '/receptk__nyv.png',
    image: '/receptk__nyv.png',
    isPremium: false,
    features: ['50+ gyors recept', 'Gaming-barát ételek', 'Tápanyag optimalizált', 'Egyszerű elkészítés'],
    detailedDescription: 'Speciálisan gamereknek készített szakácskönyv! Gyors, egészséges és finom receptek, amelyek nem zavarják meg a játékot.',
    benefits: ['5-15 perces receptek', 'Egy kézzel ehető ételek', 'Energianövelő snackek', 'Hidratáló italok', 'Gaming maratoni menük'],
    duration: 'Élethosszig hozzáférés',
  },
  {
    id: 'combo',
    name: 'Teljes JusTZoly Csomag',
    description: 'Szerezd meg mindkettőt olcsóbban!',
    price: 'Egyszeri vásárlás',
    fullPrice: '18.000 Ft',
    icon: '/jzbodybook.png',
    image: '/jzbodybook.png',
    isPremium: false,
    features: ['Otthoni edzések', '50+ gyors recept', 'Táplálkozási tanácsok', 'Gaming-egészség egyensúly'],
    detailedDescription: 'A teljes gamer életmód csomag! Kombináld az otthoni fitness programot az egészséges táplálkozással. Minden amit egy egészséges gamer életmódhoz szükséges.',
    benefits: ['50+ gyakorlat videóval', '5-15 perces receptek', 'Táplálkozási útmutató', 'Gaming szünetek optimalizálása', 'Progresszív edzésterv', 'Egy kézzel ehető ételek'],
    duration: 'Élethosszig hozzáférés',
  },
];

function artSrc(service: Service) {
  if (service.image) return service.image;
  return typeof service.icon === 'string' ? service.icon : null;
}

export default function Shop() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { addItem } = useCart();

  const addServiceToCart = (service: Service) => {
    const isSubscription = Boolean(service.isPremium) || service.id === 'rlm';
    const suffix = String(service.fullPrice).includes('/')
      ? `/ ${String(service.fullPrice).split('/')[1]}`
      : undefined;
    addItem({
      id: service.id,
      name: service.name,
      price: parseHuf(service.fullPrice),
      type: isSubscription ? 'subscription' : 'oneoff',
      priceSuffix: suffix,
      image: artSrc(service) ?? undefined,
    });
  };

  return (
    <section id="shop" className="pt-24 md:pt-36">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.32em] text-white/40">Szolgáltatásaim</p>
          <h2 className="text-[clamp(3rem,8vw,7rem)] font-black leading-[0.86] tracking-[-0.05em] text-white">
            Digitális
            <br />
            termékek.
          </h2>
          <p className="mt-6 max-w-md text-base text-white/50 md:text-lg">
            Válaszd ki a számodra legmegfelelőbb programot és kezdj fejlődni még ma!
          </p>
        </motion.div>
      </div>

      <p className="mb-4 mt-16 px-4 text-[11px] font-medium uppercase tracking-[0.32em] text-white/40 md:px-8">
        Rocket League
      </p>
      <RocketPosters
        services={rocketLeagueServices}
        onOpen={setSelectedService}
        onAdd={addServiceToCart}
      />

      <div className="rlm-glow rlm-glow-title relative mt-20 pb-16">
      <div className="mx-auto max-w-6xl px-4 pb-4 pt-16 md:px-8 md:pt-24">
        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/40">Fitness</p>
        <h3 className="mt-3 text-[clamp(3rem,7vw,6rem)] font-black leading-[0.86] tracking-[-0.05em] text-white">
          Edzés.
        </h3>
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-8">
        {otherServices.map((service, index) => (
          <MerchCard
            key={service.id}
            service={service}
            index={index}
            onOpen={setSelectedService}
            onAdd={addServiceToCart}
          />
        ))}
      </div>
      </div>

      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.6rem] border border-white/10 bg-[#0A0A0C] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                aria-label="Bezárás"
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/70 hover:text-white"
              >
                <FaTimes className="h-3.5 w-3.5" />
              </button>

              <ServiceVisual service={selectedService} className="mb-5 h-36" />
              <h2 className="text-2xl font-black tracking-tight text-white">{selectedService.name}</h2>
              <p className="mt-1 text-lg font-semibold text-white/80">{selectedService.fullPrice}</p>
              {selectedService.isPremium && (
                <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-black">
                  Premium
                </span>
              )}

              <div className="mt-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-white">Részletes leírás</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{selectedService.detailedDescription}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Mit tartalmaz?</h3>
                  <ul className="mt-2 space-y-2">
                    {selectedService.benefits.slice(0, 4).map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-white/70">
                        <FaCheck className="h-2.5 w-2.5 shrink-0 text-white/40" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 px-4 py-3">
                  <h3 className="text-[11px] uppercase tracking-[0.18em] text-white/40">Időtartam</h3>
                  <p className="mt-1 text-sm text-white/70">{selectedService.duration}</p>
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="flex-1 rounded-full border border-white/15 py-3 text-sm text-white hover:border-white/40"
                  >
                    Bezárás
                  </button>
                  <button
                    type="button"
                    onClick={() => { addServiceToCart(selectedService); setSelectedService(null); }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-black"
                  >
                    <FaShoppingCart className="h-3.5 w-3.5" /> Kosárba
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function RocketPosters({
  services,
  onOpen,
  onAdd,
}: {
  services: Service[];
  onOpen: (service: Service) => void;
  onAdd: (service: Service) => void;
}) {
  const featured = services.find((service) => service.isPremium) ?? services[0];
  const rest = services.filter((service) => service.id !== featured.id);
  return (
    <div className="grid gap-px bg-black md:grid-cols-2">
      <Poster service={featured} featured onOpen={onOpen} onAdd={onAdd} index="01" className="md:col-span-2" />
      {rest.map((service, index) => (
        <Poster key={service.id} service={service} onOpen={onOpen} onAdd={onAdd} index={`0${index + 2}`} />
      ))}
    </div>
  );
}

function Poster({
  service,
  featured,
  index,
  className,
  onOpen,
  onAdd,
}: {
  service: Service;
  featured?: boolean;
  index: string;
  className?: string;
  onOpen: (service: Service) => void;
  onAdd: (service: Service) => void;
}) {
  const src = artSrc(service);
  return (
    <article className={`group relative min-h-[78vw] overflow-hidden bg-black md:min-h-[34rem] ${featured ? 'md:min-h-[70vh]' : ''} ${className ?? ''}`}>
      {src && (
        <Image
          src={src}
          alt=""
          fill
          sizes={featured ? '100vw' : '(min-width: 768px) 50vw, 100vw'}
          className="origin-top scale-[1.35] object-cover object-top transition duration-700 ease-out group-hover:scale-[1.42]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black from-10% via-black/70 via-40% to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-5 md:p-8">
        <div className="mb-3 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.28em] text-white/70">
          <span>{index}</span>
          {service.isPremium && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] tracking-[0.16em] text-black">Premium</span>}
        </div>
        <h3 className={`font-black leading-[0.86] tracking-[-0.05em] text-white ${featured ? 'text-[clamp(3.5rem,8vw,7.5rem)]' : 'text-[clamp(2.6rem,4vw,4.2rem)]'}`}>
          {service.name}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 md:max-h-0 md:overflow-hidden md:opacity-0 md:transition-all md:duration-300 md:group-hover:max-h-24 md:group-hover:opacity-100">
          {service.description}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg font-semibold text-white">{service.fullPrice}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpen(service)}
              className="rounded-full border border-white/30 px-4 py-2.5 text-sm font-medium text-white transition hover:border-white"
            >
              Részletek
            </button>
            <button
              type="button"
              onClick={() => onAdd(service)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              <FaShoppingCart className="h-3.5 w-3.5" /> Kosárba
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

const ICON_IN = { type: 'spring' as const, stiffness: 820, damping: 32, mass: 0.42 };
const ICON_OUT = { duration: 0.09, ease: [0.4, 0, 1, 1] as const };

function CartAddButton({ onAdd }: { onAdd: () => void }) {
  const [added, setAdded] = useState(false);
  const [tick, setTick] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const add = () => {
    onAdd();
    setAdded(true);
    setTick((n) => n + 1);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 460);
  };

  return (
    <motion.button
      type="button"
      onClick={add}
      aria-label={added ? 'Kosárba került' : 'Kosárba'}
      whileTap={{ scale: 0.9 }}
      animate={{ scale: tick ? [1, 0.88, 1.06, 1] : 1 }}
      transition={{ duration: 0.2, times: [0, 0.28, 0.62, 1], ease: [0.16, 1, 0.3, 1] }}
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-black"
    >
      <span className="grid h-4 w-4 place-items-center">
        <motion.span
          aria-hidden
          animate={{ opacity: added ? 0 : 1, scale: added ? 0.3 : 1, rotate: added ? 10 : 0 }}
          transition={added ? ICON_OUT : ICON_IN}
          className="col-start-1 row-start-1 flex items-center justify-center"
        >
          <FaShoppingCart className="h-3.5 w-3.5" />
        </motion.span>
        <motion.svg
          viewBox="0 0 24 24"
          aria-hidden
          animate={{ opacity: added ? 1 : 0, scale: added ? 1 : 0.3 }}
          transition={added ? ICON_IN : ICON_OUT}
          className="col-start-1 row-start-1 h-4 w-4"
          fill="none"
        >
          <motion.path
            d="M5 12.5 L10 17.5 L19 7"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ pathLength: added ? 1 : 0 }}
            transition={{ duration: added ? 0.12 : 0.05, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.svg>
      </span>
    </motion.button>
  );
}

function MerchCard({
  service,
  index,
  onOpen,
  onAdd,
}: {
  service: Service;
  index: number;
  onOpen: (service: Service) => void;
  onAdd: (service: Service) => void;
}) {
  const src = artSrc(service);
  return (
    <article className="flex w-[82vw] shrink-0 snap-center flex-col bg-black px-4 py-8 md:w-auto md:px-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/35">0{index + 1}</p>
      <div className="relative mt-4 aspect-[3/4] overflow-hidden">
        {src && (
          <Image
            src={src}
            alt={service.name}
            fill
            sizes="(min-width: 768px) 33vw, 82vw"
            className="object-contain transition duration-500 ease-out hover:-translate-y-2 hover:scale-[1.03]"
          />
        )}
      </div>
      <h3 className="mt-6 text-3xl font-black leading-none tracking-[-0.04em] text-white md:text-4xl">{service.name}</h3>
      <p className="mt-3 min-h-12 text-sm leading-relaxed text-white/50">{service.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-lg font-semibold text-white">{service.fullPrice}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onOpen(service)}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-white/50"
          >
            Részletek
          </button>
          <CartAddButton onAdd={() => onAdd(service)} />
        </div>
      </div>
    </article>
  );
}

function ServiceVisual({ service, className }: { service: Service; className?: string }) {
  const src = artSrc(service);
  if (!src) return null;
  const photo = !src.includes('/icons/') && !src.endsWith('.png');
  return (
    <div className={`relative overflow-hidden bg-[#070707] ${className ?? ''}`}>
      <Image
        src={src}
        alt={service.name}
        fill
        sizes="480px"
        className={photo ? 'object-cover object-[center_30%]' : 'object-contain p-4'}
      />
    </div>
  );
}
