"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, Languages, User, Shield, Info, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { toast } = useToast();
  const [voice, setVoice] = useState("es-LA-Standard-A");
  const [language, setLanguage] = useState("spanish-la");

  const saveSettings = () => {
    toast({
      title: "Ajustes Actualizados",
      description: "Tu preferencia de idioma y voz se ha guardado con éxito.",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="px-2">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Configuración</h1>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-70">
          Personaliza tu IA de cocina
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
              <CardTitle className="text-xl">Idioma de Preferencia</CardTitle>
              <CardDescription>Selecciona cómo quieres que FoodAI te hable.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "english", label: "English (US)", flag: "🇺🇸" },
              { id: "spanish-es", label: "Español (España)", flag: "🇪🇸" },
              { id: "spanish-la", label: "Español (Latinoamérica)", flag: "🌎" }
            ].map((lang) => (
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
              <Volume2 className="h-4 w-4" /> Personalización de Voz
            </Label>
            <RadioGroup value={voice} onValueChange={setVoice} className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3 p-4 border-2 border-transparent bg-secondary/5 rounded-2xl hover:bg-secondary/10 cursor-pointer transition-all group">
                <RadioGroupItem value="es-LA-Standard-A" id="v1" className="border-primary text-primary" />
                <Label htmlFor="v1" className="flex-1 cursor-pointer">
                  <p className="font-bold group-hover:text-primary transition-colors">Voz Femenina (Sofía)</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Cálida y amigable</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border-2 border-transparent bg-secondary/5 rounded-2xl hover:bg-secondary/10 cursor-pointer transition-all group">
                <RadioGroupItem value="es-LA-Standard-B" id="v2" className="border-primary text-primary" />
                <Label htmlFor="v2" className="flex-1 cursor-pointer">
                  <p className="font-bold group-hover:text-primary transition-colors">Voz Masculina (Diego)</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Profesional y directo</p>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button 
            className="w-full rounded-2xl h-14 font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary" 
            onClick={saveSettings}
          >
            Aplicar Cambios Futuristas
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3 px-2">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Ecosistema</h3>
        <Card className="border-none shadow-sm glass divide-y divide-white/10 overflow-hidden">
           {[
             { icon: User, label: "Perfil Familiar", color: "text-primary" },
             { icon: Shield, label: "Privacidad Galáctica", color: "text-secondary" },
             { icon: Info, label: "Acerca de FoodAI", color: "text-accent" }
           ].map((item, i) => (
             <div key={i} className="p-5 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={cn("h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center", item.color)}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
             </div>
           ))}
        </Card>
      </div>

      <p className="text-center text-[9px] text-muted-foreground/60 uppercase tracking-[0.3em] pt-4">
        FoodAI Engine v1.5.0 • Sync Estelar
      </p>
    </div>
  );
}
