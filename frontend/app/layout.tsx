import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import AudioPlayer from '@/components/AudioPlayer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BeatMarketplace | 台灣音樂製作人伴奏市集',
  description: '探索台灣最優秀的音樂製作人，購買高品質伴奏，或聯絡製作人客製化編曲',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <AudioPlayer />
      </body>
    </html>
  );
}
