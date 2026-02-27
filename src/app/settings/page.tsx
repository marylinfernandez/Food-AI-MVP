"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, Languages, User, Shield, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [voice, setVoice] = useState("es-LA-Standard-A");
  const [language, setLanguage] = useState("spanish");

  const saveSettings = () => {
    toast({
      title: "Ajustes Guardados",
      description: "Tu asistente ha actualizado su voz y lenguaje.",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header>
        <h1 className="text-3xl font-headline font-bold text-primary">Ajustes</h1>
        <p className="text-muted-foreground text-sm">Personaliza tu experiencia con PantryPal.</p>
      </header>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-primary text-white">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            <CardTitle className="text-lg">Interfaz de Audio</CardTitle>
          </div>
          <CardDescription className="text-white/80">Configura la voz de tu asistente IA.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-bold flex items-center gap-2">
              <Languages className="h-4 w-4" /> Idioma
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="rounded-xl h-12">
                <SelectValue placeholder="Selecciona idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spanish">Español (Latino)</SelectItem>
                <SelectItem value="english">English (US)</SelectItem>
                <SelectItem value="spanish-es">Español (España)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-bold">Tipo de Voz</Label>
            <RadioGroup value={voice} onValueChange={setVoice} className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3 p-4 border rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors">
                <RadioGroupItem value="es-LA-Standard-A" id="v1" />
                <Label htmlFor="v1" className="flex-1 cursor-pointer">
                  <p className="font-bold">Sofía</p>
                  <p className="text-xs text-muted-foreground">Natural, cálida y amable</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors">
                <RadioGroupItem value="es-LA-Standard-B" id="v2" />
                <Label htmlFor="v2" className="flex-1 cursor-pointer">
                  <p className="font-bold">Diego</p>
                  <p className="text-xs text-muted-foreground">Profesional y directo</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors">
                <RadioGroupItem value="en-US-Wavenet-F" id="v3" />
                <Label htmlFor="v3" className="flex-1 cursor-pointer">
                  <p className="font-bold">Emma (English)</p>
                  <p className="text-xs text-muted-foreground">US Accent, Clear and bright</p>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button className="w-full rounded-2xl h-12 shadow-lg" onClick={saveSettings}>
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">Cuenta</h3>
        <Card className="border-none shadow-sm divide-y">
           <div className="p-4 flex justify-between items-center hover:bg-secondary/20 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Perfil Familiar</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
           </div>
           <div className="p-4 flex justify-between items-center hover:bg-secondary/20 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Privacidad y Datos</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
           </div>
           <div className="p-4 flex justify-between items-center hover:bg-secondary/20 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Acerca de PantryPal</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
           </div>
        </Card>
      </div>

      <p className="text-center text-[10px] text-muted-foreground pt-4">PantryPal AI v1.0.2 • Made with ❤️ for your kitchen</p>
    </div>
  );
}

function ArrowRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
