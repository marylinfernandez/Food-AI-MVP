
"use client";

import { useUser } from "@/firebase";
import { ThemeToggle } from "./theme-toggle";
import { Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/language-context";
import { Language } from "@/lib/i18n";
import { useTour } from "@/context/tour-context";

export function Header() {
  const { user } = useUser();
  const { language, setLanguage, t } = useTranslation();
  const { guideStep, setGuideStep } = useTour();

  const languages = [
    { id: "english" as Language, label: "EN", flag: "🇺🇸" },
    { id: "spanish-es" as Language, label: "ES", flag: "🇪🇸" },
    { id: "spanish-la" as Language, label: "LA", flag: "🌎" }
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
           <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "rounded-full h-9 gap-2 transition-all shadow-sm border px-3",
              guideStep > 0 
                ? "bg-primary text-white border-primary" 
                : "bg-background text-primary border-primary/20 hover:bg-primary/5"
            )}
            onClick={() => setGuideStep(guideStep === 0 ? 1 : 0)}
          >
            <HelpCircle className={cn("h-4 w-4", guideStep === 0 && "animate-bounce")} />
            <span className="text-[10px] font-black uppercase tracking-wider hidden xs:inline">{t('home.guide')}</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-1 bg-secondary/5 p-1 rounded-2xl border border-white/10">
        {languages.map((lang) => (
          <Button
            key={lang.id}
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(lang.id)}
            className={cn(
              "flex-1 h-8 rounded-xl text-[9px] font-bold transition-all gap-1",
              language === lang.id 
                ? "bg-white dark:bg-primary/20 text-primary shadow-sm" 
                : "text-muted-foreground hover:bg-white/5"
            )}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </Button>
        ))}
      </div>
    </header>
  );
}
