import type { Metadata } from 'next';
import { Bodoni_Moda, Inter, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const bodoniModa = Bodoni_Moda({
  variable: '--font-bodoni',
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono-custom',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Finlysis',
  description: 'Personal finance dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bodoniModa.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
