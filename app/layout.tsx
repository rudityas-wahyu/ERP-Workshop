import type {Metadata} from 'next';
import './globals.css';
import UIProvider from '@/src/components/UIProvider';
import AuthProvider from '@/src/components/AuthProvider';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Guitar Workshop ERP',
  description: 'ERP system for guitar workshop',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <UIProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
