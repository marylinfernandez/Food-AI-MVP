
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user } = useUser();
  const { language, setLanguage, t } = useTranslation();
  const { guideStep, setGuideStep } = useTour();

  const languages = [
    { id: "english" as Language, label: "English", flag: "🇺🇸" },
    { id: "spanish-es" as Language, label: "Español (ES)", flag: "🇪🇸" },
    { id: "spanish-la" as Language, label: "Español (LA)", flag: "🌎" }
  ];

  return (
    <header className="flex flex-col gap-4 mb-6 px-2 animate-in fade-in slide-in-from-top duration-500 relative z-50">
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
        
        <div className="flex items-center gap-2">
          {/* Selector de idiomas: Dropdown con un solo icono */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-secondary/10 hover:bg-secondary/20 transition-all h-10 w-10">
                <Languages className="h-5 w-5 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass border-white/10 rounded-2xl p-2 shadow-2xl">
              {languages.map((lang) => (
                <DropdownMenuItem 
                  key={lang.id} 
                  onClick={() => setLanguage(lang.id)}
                  className={cn(
                    "flex items-center gap-3 cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-colors",
                    language === lang.id 
                      ? "bg-primary text-white" 
                      : "text-muted-foreground hover:bg-primary/10"
                  )}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botón de Tour: Solo Icono */}
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "rounded-full h-10 w-10 transition-all shadow-sm border",
              guideStep > 0 
                ? "bg-primary text-white border-primary" 
                : "bg-secondary/10 text-primary border-transparent hover:bg-secondary/20"
            )}
            onClick={() => setGuideStep(guideStep === 0 ? 1 : 0)}
          >
            <HelpCircle className={cn("h-5 w-5", guideStep === 0 && "animate-bounce")} />
          </Button>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
