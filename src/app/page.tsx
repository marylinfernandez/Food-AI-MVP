
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, ChefHat, Mic, Refrigerator, ArrowRight, Sparkles, HelpCircle, Info } from "lucide-react";
import Link from "next/link";
import { usePantry } from "@/lib/pantry-store";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function HomePage() {
  const { items } = usePantry();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const fridgeHero = PlaceHolderImages.find(img => img.id === "hero-fridge");
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">PantryPal <span className="text-secondary">AI</span></h1>
          <p className="text-muted-foreground text-sm">Bienvenido, {user?.displayName || "Chef"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/10" onClick={() => setShowGuide(!showGuide)}>
            <HelpCircle className="h-5 w-5 text-secondary" />
          </Button>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="rounded-full bg-primary/10">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </Button>
          </Link>
        </div>
      </header>

      {showGuide && (
        <Card className="glass border-primary/20 bg-primary/5 animate-in slide-in-from-top duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> Guía de Funcionalidades
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="font-bold text-primary flex items-center gap-1"><Camera className="h-3 w-3" /> Escáner</p>
                <p className="text-xs text-muted-foreground">Toma una foto a tu refri y la IA identificará todo por ti.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-secondary flex items-center gap-1"><Mic className="h-3 w-3" /> Voz</p>
                <p className="text-xs text-muted-foreground">Dile "Se acabó la leche" y el inventario se actualizará.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-accent flex items-center gap-1"><ChefHat className="h-3 w-3" /> Recetas</p>
                <p className="text-xs text-muted-foreground">Genera ideas creativas basadas solo en lo que tienes hoy.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-foreground flex items-center gap-1"><Refrigerator className="h-3 w-3" /> Despensa</p>
                <p className="text-xs text-muted-foreground">Mira tu stock actual organizado por categorías y fecha.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => setShowGuide(false)}>Entendido</Button>
          </CardContent>
        </Card>
      )}

      <section className="relative h-48 rounded-[2rem] overflow-hidden shadow-2xl neo-glow group">
        <Image
          src={fridgeHero?.imageUrl || ""}
          alt="Fridge"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          data-ai-hint={fridgeHero?.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Inventario Real-Time</p>
          <h2 className="text-3xl font-bold">{items.length} Ingredientes</h2>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/scan" className="col-span-1">
                <Card className="h-full glass hover:scale-105 transition-all cursor-pointer group border-none">
                  <CardHeader className="pb-2">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                      <Camera className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" />
                    </div>
                    <CardTitle className="text-lg">Escanear</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Visión artificial IA</p>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Analiza tu nevera con la cámara</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/talk" className="col-span-1">
                <Card className="h-full glass hover:scale-105 transition-all cursor-pointer group border-none">
                  <CardHeader className="pb-2">
                    <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-2">
                      <Mic className="h-6 w-6 text-secondary group-hover:scale-110 transition-transform" />
                    </div>
                    <CardTitle className="text-lg">Hablar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Comandos de voz</p>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Actualiza inventario hablando</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" /> Sugerencias IA
          </h3>
          <Link href="/recipes" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">
            Explorar todas
          </Link>
        </div>

        <Card className="overflow-hidden glass border-none group">
          <CardContent className="p-0 flex items-center">
            <div className="relative w-32 h-32 flex-shrink-0">
               <Image 
                src="https://picsum.photos/seed/pasta/300/300" 
                alt="Quick Meal" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                data-ai-hint="gourmet pasta"
               />
               <div className="absolute inset-0 bg-primary/20 group-hover:opacity-0 transition-opacity" />
            </div>
            <div className="p-5 flex-1 space-y-2">
              <Badge className="bg-primary/20 text-primary border-none">Práctico • 15 min</Badge>
              <h4 className="font-bold text-lg leading-tight">Pasta Express Mediterránea</h4>
              <Link href="/recipes">
                <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 h-8 px-4 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" /> Cocinar con IA
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="bg-gradient-to-r from-primary to-secondary rounded-[2rem] p-8 text-white space-y-4 shadow-xl neo-glow">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Perfil Inteligente</p>
          <h3 className="text-2xl font-bold">¿Listo para personalizar?</h3>
          <p className="text-sm opacity-90 leading-relaxed">Configura tus gustos y alergias para que la IA cocine exactamente lo que amas.</p>
        </div>
        <Link href="/onboarding" className="block">
          <Button className="w-full rounded-2xl bg-white text-primary hover:bg-white/90 font-bold h-12">
            Iniciar Configuración <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  );
}

function SettingsIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
