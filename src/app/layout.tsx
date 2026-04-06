import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { LanguageProvider } from '@/context/language-context';
import { TourProvider } from '@/context/tour-context';
import { TourOverlay } from '@/components/layout/tour-overlay';
import { PWAInstallPrompt } from '@/components/layout/pwa-install-prompt';

export const metadata: Metadata = {
  title: 'FoodAI - Tu Asistente de Cocina Inteligente',
  description: 'Gestión de despensa impulsada por IA y generación de recetas personalizadas.',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FoodAI",
  },
  icons: {
    apple: "/icon-192.png",
    icon: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="FoodAI" />
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
          <LanguageProvider>
            <TourProvider>
              <main className="min-h-screen max-w-lg mx-auto relative px-4 pt-6">
                <Header />
                <TourOverlay />
                <PWAInstallPrompt />
                {children}
              </main>
              <BottomNav />
              <Toaster />
            </TourProvider>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}