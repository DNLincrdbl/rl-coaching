import type { Metadata } from 'next';
import Link from 'next/link';
import RlmLogo from '@/app/components/RlmLogo';

export const metadata: Metadata = {
  title: 'Adatvédelem',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-gray-300 px-4 py-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center" aria-label="RLM">
          <RlmLogo height={48} />
        </Link>
        <Link href="/" className="text-sm text-orange-400 hover:text-orange-300">
          ← Vissza a főoldalra
        </Link>
        <h1 className="text-3xl font-bold text-white">Adatvédelmi tájékoztató</h1>
        <p className="text-gray-400 leading-relaxed">
          A JusTZoly / Rocket League Mesterfokon platform a fiókod adatait (e-mail, megjelenített név,
          rang, fejlődési adatok) a szolgáltatás nyújtásához tárolja. A jelszavad soha nem szöveges
          formában kerül mentésre. Harmadik félnek nem adjuk el az adataidat.
        </p>
        <p className="text-gray-400 leading-relaxed">
          Kérdés esetén írj a <a href="mailto:contact@example.com" className="text-orange-400 hover:underline">contact@example.com</a> címre.
        </p>
      </div>
    </main>
  );
}
