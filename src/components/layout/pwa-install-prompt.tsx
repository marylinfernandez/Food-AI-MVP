
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Download, X, Sparkles } from "lucide-react";
import { useTranslation } from "@/context/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Componente para gestionar la instalación de la PWA.
 * Aparece después del login si el navegador detecta que la app es instalable.
 */
export function PWAInstallPrompt() {
  const { user } = useUser();
  const { language } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Solo mostramos si el usuario está logueado
      if (user) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [user]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible || !user) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-[100] px-4 animate-in slide-in-from-top duration-700 max-w-lg mx-auto pointer-events-none">
      <Card className="glass border-primary/40 bg-primary/10 overflow-hidden relative shadow-2xl border-2 pointer-events-auto">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-primary/20" 
          onClick={() => setIsVisible(false)}
        >
          <X className="h-3 w-3" />
        </Button>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg">
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-primary">
              {language === 'english' ? "App Available" : "App Disponible"}
            </p>
            <p className="text-[10px] font-medium text-foreground/80 leading-tight">
              {language === 'english' 
                ? "Download FoodAI for a faster, offline experience." 
                : "Descarga FoodAI para una experiencia más rápida y sin conexión."}
            </p>
          </div>
          <Button 
            size="sm" 
            className="rounded-xl px-4 bg-primary font-bold shadow-lg hover:scale-105 transition-transform"
            onClick={handleInstall}
          >
            <Download className="h-4 w-4 mr-2" />
            {language === 'english' ? "Install" : "Instalar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
