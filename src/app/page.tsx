"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, ChefHat, Mic, Refrigerator, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePantry } from "@/lib/pantry-store";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function HomePage() {
  const { items } = usePantry();
  const fridgeHero = PlaceHolderImages.find(img => img.id === "hero-fridge");

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">PantryPal AI</h1>
          <p className="text-muted-foreground text-sm">¿Qué vamos a cocinar hoy?</p>
        </div>
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </Link>
      </header>

      <section className="relative h-48 rounded-3xl overflow-hidden shadow-xl">
        <Image
          src={fridgeHero?.imageUrl || ""}
          alt="Fridge"
          fill
          className="object-cover"
          data-ai-hint={fridgeHero?.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="absolute bottom-4 left-6 text-white">
          <p className="text-sm font-medium opacity-90">Tu despensa actual</p>
          <h2 className="text-2xl font-bold">{items.length} Ingredientes listos</h2>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/scan" className="col-span-1">
          <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
            <CardHeader className="pb-2">
              <Camera className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg mt-2">Escanear</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Analiza tu nevera con IA</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/talk" className="col-span-1">
          <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
            <CardHeader className="pb-2">
              <Mic className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg mt-2">Hablar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Actualiza por voz</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" />
            Sugerencias de Hoy
          </h3>
          <Link href="/recipes" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <Card className="overflow-hidden border-none bg-accent/10 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-0 flex items-center">
            <div className="relative w-32 h-32 flex-shrink-0">
               <Image 
                src="https://picsum.photos/seed/pasta/200/200" 
                alt="Quick Meal" 
                fill 
                className="object-cover"
                data-ai-hint="quick pasta"
               />
            </div>
            <div className="p-4 space-y-1">
              <Badge variant="secondary" className="bg-white text-primary">Práctico • 15 min</Badge>
              <h4 className="font-bold text-lg">Pasta Express Mediterránea</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">Usa tu mantequilla y leche restante.</p>
              <Link href="/recipes">
                <Button size="sm" className="mt-2 text-xs rounded-full bg-primary h-7">
                  <Sparkles className="h-3 w-3 mr-1" /> Cocinar ahora
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="bg-primary/5 rounded-3xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            ?
          </div>
          <div>
            <p className="font-bold text-sm">¿Primera vez aquí?</p>
            <p className="text-xs text-muted-foreground">Configura tu perfil familiar por voz.</p>
          </div>
        </div>
        <Link href="/onboarding" className="block">
          <Button variant="outline" className="w-full rounded-2xl border-primary/20 hover:bg-primary/10 transition-colors">
            Comenzar configuración <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  );
}

function SettingsIcon(props: any) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
