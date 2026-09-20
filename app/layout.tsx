import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { I18nProvider } from '@/lib/i18n/context';
import { AuthProvider } from '@/lib/auth/context';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingHelp from '@/components/layout/FloatingHelp';
import { IBM_Plex_Sans, IBM_Plex_Sans_Devanagari, Noto_Sans_Bengali } from 'next/font/google';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-latin',
});
const plexDevanagari = IBM_Plex_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-devanagari',
});
const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://meghasolar.example.com'),
  title: 'Megha Solar Solutions — Solar Installation & PM Surya Ghar Assistance in Meghalaya',
  description: 'Megha Solar Solutions helps you understand the PM Surya Ghar: Muft Bijli Yojana and supports you through the solar installation process. Serving Nongstoin, Myrâng, Dhirang, Chyllang, and Lumingshai in Meghalaya.',
  keywords: ['solar installation Meghalaya', 'PM Surya Ghar Meghalaya', 'rooftop solar Meghalaya', 'solar panel installation Nongstoin', 'Muft Bijli Yojana Meghalaya', 'Megha Solar Solutions'],
  openGraph: {
    title: 'Megha Solar Solutions — Solar Installation & PM Surya Ghar Assistance',
    description: 'Solar installation, maintenance, and PM Surya Ghar scheme assistance across Meghalaya.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plexSans.variable} ${plexDevanagari.variable} ${notoBengali.variable}`}>
        <I18nProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <FloatingHelp />
            </div>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
