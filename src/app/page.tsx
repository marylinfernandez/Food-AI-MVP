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
      <div className="flex justify-between items-center px-1">
        <p className="text-muted-foreground text-sm font-medium">Estado de tu cocina</p>
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full bg-secondary/10 h-8 gap-2" 
          onClick={() => setShowGuide(!showGuide)}
        >
          <HelpCircle className="h-4 w-4 text-secondary" />
          <span className="text-xs">Ver Guía</span>
        </Button>
      </div>

      {showGuide && (
        <Card className="glass border-primary/20 bg-primary/5 animate-in slide-in-from-top duration-500 overflow-hidden">
          <CardHeader className="pb-2 bg-primary/10">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Info className="h-5 w-5" /> Guía de Funcionalidades
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="font-bold text-primary flex items-center gap-1"><Camera className="h-3 w-3" /> Escáner</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Toma una foto y la IA identificará todo por ti.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-secondary flex items-center gap-1"><Mic className="h-3 w-3" /> Voz</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Dile "Se acabó la leche" y el inventario se actualizará.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-accent flex items-center gap-1"><ChefHat className="h-3 w-3" /> Recetas</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Ideas creativas basadas solo en lo que tienes hoy.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-foreground flex items-center gap-1"><Refrigerator className="h-3 w-3" /> Despensa</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Mira tu stock organizado por categorías.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full rounded-xl border-primary/20" onClick={() => setShowGuide(false)}>Cerrar Guía</Button>
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Inventario Real-Time</p>
          <h2 className="text-3xl font-bold">{items.length} Ingredientes</h2>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/scan" className="col-span-1">
          <Card className="h-full glass hover:scale-105 transition-all cursor-pointer group border-none">
            <CardHeader className="pb-2 p-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Camera className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
              </div>
              <CardTitle className="text-base">Escanear</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Visión artificial</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/talk" className="col-span-1">
          <Card className="h-full glass hover:scale-105 transition-all cursor-pointer group border-none">
            <CardHeader className="pb-2 p-4">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-2">
                <Mic className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-base">Hablar</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Comandos de voz</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" /> Sugerencias IA
          </h3>
          <Link href="/recipes" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
            Ver todas
          </Link>
        </div>

        <Card className="overflow-hidden glass border-none group">
          <CardContent className="p-0 flex items-center">
            <div className="relative w-28 h-28 flex-shrink-0">
               <Image 
                src="https://picsum.photos/seed/pasta/300/300" 
                alt="Quick Meal" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                data-ai-hint="gourmet pasta"
               />
               <div className="absolute inset-0 bg-primary/20 group-hover:opacity-0 transition-opacity" />
            </div>
            <div className="p-4 flex-1 space-y-1">
              <Badge className="bg-primary/20 text-primary border-none text-[10px]">Práctico • 15 min</Badge>
              <h4 className="font-bold text-base leading-tight">Pasta Express Mediterránea</h4>
              <Link href="/recipes">
                <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 h-7 px-3 text-[10px] mt-1">
                  <Sparkles className="h-3 w-3 mr-1" /> Cocinar ahora
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="bg-gradient-to-r from-primary/90 to-secondary/90 backdrop-blur-md rounded-[2rem] p-6 text-white space-y-4 shadow-xl neo-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full -mr-16 -mt-16"></div>
        <div className="space-y-1 relative z-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-70">Perfil Inteligente</p>
          <h3 className="text-xl font-bold">¿Listo para personalizar?</h3>
          <p className="text-xs opacity-90 leading-relaxed">Configura tus gustos y alergias para que la IA cocine exactamente lo que amas.</p>
        </div>
        <Link href="/onboarding" className="block relative z-10">
          <Button className="w-full rounded-xl bg-white text-primary hover:bg-white/90 font-bold h-10 text-xs shadow-lg">
            Configurar Perfil <ArrowRight className="h-3 w-3 ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
