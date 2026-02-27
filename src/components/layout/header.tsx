
"use client";

import { useUser, useAuth } from "@/firebase";
import { ThemeToggle } from "./theme-toggle";
import { Sparkles, HelpCircle, Languages, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/language-context";
import { Language } from "@/lib/i18n";
import { useTour } from "@/context/tour-context";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * @fileOverview Encabezado global con botones alineados matemáticamente y cierre de sesión.
 */
export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const { guideStep, setGuideStep } = useTour();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const languages = [
    { id: "english" as Language, label: "EN", flag: "🇺🇸" },
    { id: "spanish-es" as Language, label: "ES", flag: "🇪🇸" },
    { id: "spanish-la" as Language, label: "LA", flag: "🌎" }
  ];

  const showInternalControls = mounted && user && pathname !== '/login';

  return (
    <header className="flex justify-between items-center mb-6 px-2 animate-in fade-in slide-in-from-top duration-500 relative z-[60] w-full">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.4)] neo-glow group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col -space-y-1">
          <h1 className="text-xl font-bold text-primary tracking-tighter leading-none">
            Food<span className="text-secondary">AI</span>
          </h1>
          {mounted && user && (
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              {user.displayName || user.email?.split('@')[0] || "Chef"}
            </span>
          )}
        </div>
      </Link>
      
      <div className="flex items-center gap-1.5 bg-white/20 dark:bg-black/40 p-1.5 rounded-full backdrop-blur-xl border border-white/20 shadow-lg ml-auto">
        {/* Idioma - Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-white/30 text-primary">
              <Languages className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass border-white/20 rounded-2xl p-1 shadow-2xl min-w-[80px] z-[70]">
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

        {/* Tour - Condicional */}
        {showInternalControls && (
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "rounded-full h-8 w-8 transition-all",
              guideStep > 0 
                ? "bg-primary text-white shadow-lg" 
                : "hover:bg-white/30 text-primary"
            )}
            onClick={() => setGuideStep(guideStep === 0 ? 1 : 0)}
          >
            <HelpCircle className={cn("h-4 w-4", guideStep === 0 && "animate-bounce")} />
          </Button>
        )}
        
        <ThemeToggle />

        {/* Cerrar Sesión - Condicional */}
        {showInternalControls && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-8 w-8 hover:bg-destructive/10 text-destructive transition-all"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
