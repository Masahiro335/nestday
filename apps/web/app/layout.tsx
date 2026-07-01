import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LoadingGameProvider from '@/components/ui/LoadingGameProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'NestDay',
  description: 'グループ共有カレンダーアプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={inter.variable}>
        <LoadingGameProvider>{children}</LoadingGameProvider>
      </body>
    </html>
  );
}
