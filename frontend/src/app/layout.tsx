import type { Metadata, Viewport } from 'next';
import { Great_Vibes, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import ToastHost from './components/ToastHost';
import CartFab from './components/CartFab';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const signature = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-signature',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'RLM | Rocket League Mesterfokon',
    template: '%s | RLM',
  },
  description: 'Professzionális Rocket League coaching platform — személyre szabott replay elemzés, aréna, kurzusok.',
  icons: {
    icon: [{ url: '/rlmlogo.png', type: 'image/png' }],
    apple: [{ url: '/rlmlogo.png', type: 'image/png' }],
    shortcut: '/rlmlogo.png',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
  colorScheme: 'dark',
};

// The app uses a single, fixed dark theme — no theme switching.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu" className={`dark ${outfit.variable} ${signature.variable}`} style={{ colorScheme: 'dark' }}>
      <body className={`${outfit.className} antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartFab />
            <ToastHost />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
