/* app/layout.tsx */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'SmartExam AI | Future of Learning',
  description: 'AI-powered exam generation and predictive analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
          {children}
        </main>
      </body>
    </html>
  );
}
