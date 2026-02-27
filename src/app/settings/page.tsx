
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Volume2, Languages, User, Shield, Info, ArrowRight, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/language-context";
import { Language } from "@/lib/i18n";

export default function SettingsPage() {
  const { toast } = useToast();
  const { t, language, setLanguage } = useTranslation();
  const [voice, setVoice] = useState("Algenib");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedVoice = localStorage.getItem('foodai_voice');
    if (savedVoice) setVoice(savedVoice);
  }, []);

  const saveSettings = () => {
    setLoading(true);
    localStorage.setItem('foodai_voice', voice);
    
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Ajustes Actualizados",
        description: "Tu preferencia de idioma y voz se ha guardado con éxito.",
      });
    }, 500);
  };

  const languages = [
    { id: "english" as Language, label: "English (US)", flag: "🇺🇸" },
    { id: "spanish-es" as Language, label: "Español (España)", flag: "🇪🇸" },
    { id: "spanish-la" as Language, label: "Español (Latinoamérica)", flag: "🌎" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="px-2">
        <h1 className="text-3xl font-bold text-primary tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-70">
          {t('settings.subtitle')}
        </p>
      </header>

      <Card className="border-none shadow-xl glass overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Languages className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{t('settings.langTitle')}</CardTitle>
              <CardDescription>{t('settings.langDesc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            {languages.map((lang) => (
              <div 
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all",
                  language === lang.id 
                    ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.1)]" 
                    : "border-transparent bg-secondary/5 hover:bg-secondary/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-bold">{lang.label}</span>
                </div>
                {language === lang.id && <Check className="h-5 w-5 text-primary" />}
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-4">
            <Label className="text-sm font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
              <Volume2 className="h-4 w-4" /> {t('settings.voiceTitle')}
            </Label>
            <RadioGroup value={voice} onValueChange={setVoice} className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3 p-4 border-2 border-transparent bg-secondary/5 rounded-2xl hover:bg-secondary/10 cursor-pointer transition-all group">
                <RadioGroupItem value="Algenib" id="v1" className="border-primary text-primary" />
                <Label htmlFor="v1" className="flex-1 cursor-pointer">
                  <p className="font-bold group-hover:text-primary transition-colors">Voz Femenina (Sofía)</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border-2 border-transparent bg-secondary/5 rounded-2xl hover:bg-secondary/10 cursor-pointer transition-all group">
                <RadioGroupItem value="Achernar" id="v2" className="border-primary text-primary" />
                <Label htmlFor="v2" className="flex-1 cursor-pointer">
                  <p className="font-bold group-hover:text-primary transition-colors">Voz Masculina (Diego)</p>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button 
            className="w-full rounded-2xl h-14 font-bold text-lg shadow-lg transition-all bg-primary" 
            onClick={saveSettings}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : t('settings.applyBtn')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
