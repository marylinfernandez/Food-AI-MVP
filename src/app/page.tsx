
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, ChefHat, Refrigerator, ArrowRight, Sparkles, HelpCircle, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { usePantry } from "@/lib/pantry-store";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/context/language-context";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Página principal de FoodAI.
 * Incluye el Tour Interactivo que guía al usuario por las funcionalidades.
 */
export default function HomePage() {
  const { items } = usePantry();
  const { user, isUserLoading } = useUser();
  const { t, language } = useTranslation();
  const router = useRouter();
  const fridgeHero = PlaceHolderImages.find(img => img.id === "hero-fridge");
  const [guideStep, setGuideStep] = useState<number>(0);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) return null;

  const nextStep = () => {
    if (guideStep === 5) {
      setGuideStep(0);
      return;
    }
    setGuideStep(prev => prev + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* HEADER DE BIENVENIDA Y BOTÓN DE TOUR */}
      <div className="flex justify-between items-center px-1">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{t('home.title')}</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "rounded-full h-9 gap-2 transition-all shadow-sm border",
            guideStep > 0 
              ? "bg-primary text-white border-primary" 
              : "bg-background text-primary border-primary/20 hover:bg-primary/5"
          )}
          onClick={() => setGuideStep(guideStep === 0 ? 1 : 0)}
        >
          <HelpCircle className={cn("h-4 w-4", guideStep === 0 && "animate-bounce")} />
          <span className="text-xs font-bold uppercase tracking-wider">{t('home.guide')}</span>
        </Button>
      </div>

      {/* TARJETA DEL TOUR INTERACTIVO (Pop-up dinámico) */}
      {guideStep > 0 && (
        <Card className="glass border-primary/40 bg-primary/10 animate-in slide-in-from-top duration-500 overflow-hidden relative shadow-2xl border-2">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-primary/20" onClick={() => setGuideStep(0)}>
            <X className="h-3 w-3" />
          </Button>
          <CardHeader className="pb-2 bg-primary/20">
            <CardTitle className="text-lg flex items-center gap-2 text-primary font-black uppercase tracking-tight">
              <Sparkles className="h-5 w-5 animate-pulse" /> {t(`guide.step${guideStep}.title`)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4 pt-4">
            <p className="leading-relaxed font-medium italic text-foreground/90">"{t(`guide.step${guideStep}.desc`)}"</p>
            <div className="flex justify-between items-center pt-2">
               <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">{guideStep} / 5</span>
               <Button size="sm" className="rounded-xl px-6 bg-primary font-bold shadow-lg hover:scale-105 transition-transform" onClick={nextStep}>
                 {guideStep === 5 ? t('guide.finish') : t('guide.next')} <ChevronRight className="h-3 w-3 ml-1" />
               </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECCIÓN 2: DESPENSA (Resaltada en Paso 2) */}
      <section className={cn(
        "relative h-48 rounded-[2rem] overflow-hidden shadow-2xl neo-glow group transition-all duration-500",
        guideStep === 2 && "ring-4 ring-primary ring-offset-4 ring-offset-background scale-[1.02]"
      )}>
        <Image
          src={fridgeHero?.imageUrl || ""}
          alt="Fridge"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          data-ai-hint={fridgeHero?.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Inventario en tiempo real</p>
          <h2 className="text-3xl font-bold">{items.length} {t('home.ingredients')}</h2>
        </div>
        {guideStep === 2 && (
          <div className="absolute -top-3 -right-3 h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center font-black shadow-xl animate-bounce border-2 border-white z-20">2</div>
        )}
      </section>

      {/* SECCIÓN 1: ESCÁNER (Resaltada en Paso 1) */}
      <div className="grid grid-cols-1 gap-4">
        <Link href="/scan" className="col-span-1">
          <Card className={cn(
            "h-24 glass hover:scale-[1.02] transition-all cursor-pointer group border-none flex items-center relative",
            guideStep === 1 && "ring-4 ring-primary ring-offset-4 ring-offset-background shadow-[0_0_30px_rgba(var(--primary),0.3)]"
          )}>
            <CardHeader className="flex flex-row items-center gap-4 w-full p-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Camera className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">{t('home.scanBtn')}</CardTitle>
            </CardHeader>
            {guideStep === 1 && (
              <div className="absolute -top-3 -right-3 h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center font-black shadow-xl animate-bounce border-2 border-white">1</div>
            )}
          </Card>
        </Link>
      </div>

      {/* SECCIÓN 3: RECETAS (Resaltada en Paso 3 y 4) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" /> {t('home.aiSuggestions')}
          </h3>
          <Link href="/recipes" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
            {t('home.viewAll')}
          </Link>
        </div>

        <Card className={cn(
          "overflow-hidden glass border-none group relative transition-all duration-500",
          (guideStep === 3 || guideStep === 4) && "ring-4 ring-primary ring-offset-4 ring-offset-background scale-[1.01]"
        )}>
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
              <Badge className="bg-primary/20 text-primary border-none text-[10px] font-bold">Práctico • 15 min</Badge>
              <h4 className="font-bold text-base leading-tight">
                {language === 'english' ? 'Mediterranean Pasta Express' : 'Pasta Express Mediterránea'}
              </h4>
              <Link href="/recipes">
                <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 h-7 px-3 text-[10px] mt-1 font-bold shadow-md">
                  <Sparkles className="h-3 w-3 mr-1" /> {t('home.cookNow')}
                </Button>
              </Link>
            </div>
          </CardContent>
          {(guideStep === 3 || guideStep === 4) && (
            <div className="absolute -top-3 -right-3 h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center font-black shadow-xl animate-bounce border-2 border-white">
              {guideStep}
            </div>
          )}
        </Card>
      </section>

      {/* SECCIÓN 5: HISTORIAL/PERFIL (Resaltada en Paso 5) */}
      <section className={cn(
        "bg-gradient-to-r from-primary/90 to-secondary/90 backdrop-blur-md rounded-[2rem] p-6 text-white space-y-4 shadow-xl neo-glow relative overflow-hidden transition-all duration-500",
        guideStep === 5 && "ring-4 ring-primary ring-offset-4 ring-offset-background scale-[1.02]"
      )}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full -mr-16 -mt-16"></div>
        <div className="space-y-1 relative z-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-70">Perfil Inteligente</p>
          <h3 className="text-xl font-bold">{t('home.profileTitle')}</h3>
          <p className="text-xs opacity-90 leading-relaxed font-medium">{t('home.profileDesc')}</p>
        </div>
        <Link href="/onboarding" className="block relative z-10">
          <Button className="w-full rounded-xl bg-white text-primary hover:bg-white/90 font-bold h-10 text-xs shadow-lg uppercase tracking-wider">
            {t('home.setupBtn')} <ArrowRight className="h-3 w-3 ml-2" />
          </Button>
        </Link>
        {guideStep === 5 && (
          <div className="absolute -top-3 -right-3 h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center font-black shadow-xl animate-bounce border-2 border-white">5</div>
        )}
      </section>
    </div>
  );
}
