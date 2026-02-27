import type { Metadata } from 'next';
import './globals.css';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'FoodAI - Tu Asistente de Cocina Inteligente',
  description: 'Gestión de despensa impulsada por IA y generación de recetas personalizadas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              const theme = localStorage.getItem('theme');
              const supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
              if (theme === 'dark' || (!theme && supportDarkMode)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          })();
        ` }} />
      </head>
      <body className="font-body antialiased bg-background pb-20 transition-colors duration-300">
        <FirebaseClientProvider>
          <main className="min-h-screen max-w-lg mx-auto relative px-4 pt-6">
            <Header />
            {children}
          </main>
          <BottomNav />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
