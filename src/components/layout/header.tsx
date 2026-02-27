
"use client";

import { useUser } from "@/firebase";
import { ThemeToggle } from "./theme-toggle";
import { Sparkles, HelpCircle, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/language-context";
import { Language } from "@/lib/i18n";
import { useTour } from "@/context/tour-context";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * @fileOverview Encabezado global con selectores de idioma, tour y tema.
 * Los controles están agrupados en la parte superior derecha para una interfaz limpia.
 */
export function Header() {
  const { user, isUserLoading } = useUser();
  const { language, setLanguage, t } = useTranslation();
  const { guideStep, setGuideStep } = useTour();
  const pathname = usePathname();

  const languages = [
    { id: "english" as Language, label: "EN", flag: "🇺🇸" },
    { id: "spanish-es" as Language, label: "ES", flag: "🇪🇸" },
    { id: "spanish-la" as Language, label: "LA", flag: "🌎" }
  ];

  // No mostrar el botón de tour si estamos en login o no hay usuario
  const showTourButton = !isUserLoading && user && pathname !== '/login';

  return (
    <header className="flex flex-col gap-4 mb-6 px-2 animate-in fade-in slide-in-from-top duration-500 relative z-[60]">
      <div className="flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.4)] neo-glow group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col -space-y-1">
            <h1 className="text-xl font-bold text-primary tracking-tighter">
              Food<span className="text-secondary">AI</span>
            </h1>
            {user && (
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                {user.displayName || "Chef"}
              </span>
            )}
          </div>
        </Link>
        
        <div className="flex items-center gap-2 bg-white/10 dark:bg-black/20 p-1 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
          {/* Selector de idiomas: Dropdown elegante */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-white/20">
                <Languages className="h-4 w-4 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass border-white/10 rounded-2xl p-1 shadow-2xl min-w-[100px]">
              {languages.map((lang) => (
                <DropdownMenuItem 
                  key={lang.id} 
                  onClick={() => setLanguage(lang.id)}
                  className={cn(
                    "flex items-center justify-between cursor-pointer rounded-xl px-3 py-1.5 text-[10px] font-bold transition-colors",
                    language === lang.id 
                      ? "bg-primary text-white" 
                      : "text-muted-foreground hover:bg-primary/10"
                  )}
                >
                  <span>{lang.flag} {lang.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botón de Tour: Solo aparece si hay usuario logeado y no está en login */}
          {showTourButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "rounded-full h-9 w-9 transition-all",
                guideStep > 0 
                  ? "bg-primary text-white shadow-lg" 
                  : "hover:bg-white/20 text-primary"
              )}
              onClick={() => setGuideStep(guideStep === 0 ? 1 : 0)}
            >
              <HelpCircle className={cn("h-4 w-4", guideStep === 0 && "animate-bounce")} />
            </Button>
          )}
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
