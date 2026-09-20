import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cavalcata-sant-anna-prototipo.dc-ernesto13.chatgpt.site'),
  title: 'Cavalcata di Sant’Anna',
  description: 'Segui il percorso della Cavalcata di Sant’Anna e scopri le storie delle sue tappe.',
  openGraph: {
    title: 'Cavalcata di Sant’Anna',
    description: 'Tradizione, fede e territorio. Segui il percorso e scopri le storie delle sue tappe.',
    locale: 'it_IT',
    type: 'website',
    images: [{ url: '/og.png', width: 1728, height: 909, alt: 'Cavalcata di Sant’Anna — Tradizione, fede e territorio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cavalcata di Sant’Anna',
    description: 'Tradizione, fede e territorio. Segui il percorso e scopri le storie delle sue tappe.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
