
"use client";

import { useUser } from "@/firebase";
import { ThemeToggle } from "./theme-toggle";
import { Sparkles, Languages, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/context/language-context";
import { Language } from "@/lib/i18n";

export function Header() {
  const { user } = useUser();
  const { toast } = useToast();
  const { language, setLanguage, t } = useTranslation();

  const changeLanguage = (langId: Language, label: string) => {
    setLanguage(langId);
    toast({
      title: t('header.langUpdated'),
      description: t('header.langDesc'),
    });
  };

  const languages = [
    { id: "english" as Language, label: "English", flag: "🇺🇸" },
    { id: "spanish-es" as Language, label: "Español (ES)", flag: "🇪🇸" },
    { id: "spanish-la" as Language, label: "Español (LATAM)", flag: "🌎" }
  ];

  return (
    <header className="flex justify-between items-center mb-6 px-2 animate-in fade-in slide-in-from-top duration-500 relative z-50">
      <div className="flex flex-col">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.4)] neo-glow group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col -space-y-1">
            <h1 className="text-xl font-bold text-primary tracking-tighter">
              Food<span className="text-secondary">AI</span>
            </h1>
            {user && (
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                {t('header.nexus')}: {user.displayName || "Chef"}
              </span>
            )}
          </div>
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary transition-all duration-300"
            >
              <Languages className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 glass border-white/10 rounded-2xl p-2">
            {languages.map((lang) => (
              <DropdownMenuItem 
                key={lang.id} 
                onClick={() => changeLanguage(lang.id, lang.label)}
                className={cn(
                  "flex items-center justify-between rounded-xl cursor-pointer p-3 transition-colors",
                  language === lang.id ? "bg-primary/20 text-primary" : "hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span className="font-bold text-xs uppercase tracking-wider">{lang.label}</span>
                </div>
                {language === lang.id && <Check className="h-3 w-3" />}
              </DropdownMenuItem>
            ))}
            <div className="pt-2 mt-2 border-t border-white/10">
              <Link href="/settings" className="w-full">
                <DropdownMenuItem className="text-[10px] text-center w-full justify-center opacity-60 uppercase font-bold hover:opacity-100">
                  Settings
                </DropdownMenuItem>
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
      </div>
    </header>
  );
}
