import type { Metadata } from 'next';
import './globals.css';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'PantryPal AI - Your Intelligent Kitchen Assistant',
  description: 'AI-driven pantry management and personalized recipe generation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background pb-20">
        <main className="min-h-screen max-w-lg mx-auto relative px-4 pt-6">
          {children}
        </main>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
