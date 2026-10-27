import type { Metadata } from 'next';
import Link from 'next/link';
import RlmLogo from '@/app/components/RlmLogo';

export const metadata: Metadata = {
  title: 'Felhasználási feltételek',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-gray-300 px-4 py-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center" aria-label="RLM">
          <RlmLogo height={48} />
        </Link>
        <Link href="/" className="text-sm text-orange-400 hover:text-orange-300">
          ← Vissza a főoldalra
        </Link>
        <h1 className="text-3xl font-bold text-white">Felhasználási feltételek</h1>
        <p className="text-gray-400 leading-relaxed">
          A platform használatával elfogadod, hogy a tartalmak (kurzusok, elemzések, aréna) személyes
          használatra szólnak, és nem másolhatók tovább értékesítés céljából. A coaching és replay
          szolgáltatások a megvásárolt csomag / kredit keretein belül érhetők el.
        </p>
        <p className="text-gray-400 leading-relaxed">
          A szolgáltatás folyamatosan fejlődik; a funkciók és árak változhatnak. A fizetési feltételek
          a Stripe-integráció élesítése után a checkout során jelennek meg részletesen.
        </p>
      </div>
    </main>
  );
}
