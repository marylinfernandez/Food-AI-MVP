"use client";

import { usePantry } from "@/lib/pantry-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ChefHat, Timer, Trash2, History, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/context/language-context";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useTour } from "@/context/tour-context";
import { cn, normalizeText } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PantryPage() {
  const { items, historyRecipes, removeItem } = usePantry();
  const { t, language } = useTranslation();
  const { guideStep } = useTour();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateSeed, setDateSeed] = useState<string>("");

  useEffect(() => {
    if (!isUserLoading && !user) {
      console.log("No hay usuario detectado. El guardia te habría expulsado aquí.");
      // COMENTAMOS LA REDIRECCIÓN TEMPORALMENTE PARA VER QUÉ PASA
      // router.push("/login"); 
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const today = new Date();
    const seed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    setDateSeed(seed);
  }, []);

  // PANTALLAS DE ESPERA VISUALES PARA DEBUGGEAR
  if (isUserLoading) {
    return <div className="flex h-screen items-center justify-center text-primary font-bold">Cargando conexión con Firebase...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4">
        <p className="text-destructive font-bold">Sin sesión activa en esta página.</p>
        <Button onClick={() => router.push("/login")}>Volver al Login manualmente</Button>
      </div>
    );
  }

  const dayItems = items.filter(item => {
    if (!date) return false;
    const itemDate = new Date(item.scannedAt);
    return itemDate.toDateString() === date.toDateString();
  });

  const dayRecipes = historyRecipes
    .filter(recipe => {
      if (!date) return false;
      const recipeDate = new Date(recipe.scannedAt);
      return recipeDate.toDateString() === date.toDateString();
    })
    .filter((recipe, index, self) => 
      index === self.findIndex((t) => normalizeText(t.name) === normalizeText(recipe.name))
    );

  const isToday = date?.toDateString() === new Date().toDateString();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <header className="px-2 space-y-1">
        <h1 className="text-3xl font-bold text-primary tracking-tight">{t('pantry.title')}</h1>
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-70">
            {isToday ? t('pantry.subtitle') : t('pantry.historyMode')}
          </p>
        </div>
      </header>

      <div className={cn(
        "relative rounded-[2rem] overflow-hidden shadow-2xl glass transition-all duration-500",
        guideStep === 5 && "ring-4 ring-primary ring-offset-4 ring-offset-background scale-[1.02]"
      )}>
        <Card className="border-none overflow-hidden rounded-[2rem] mx-auto group w-full max-w-md relative bg-transparent shadow-none">
          {dateSeed && (
            <div className="absolute inset-0 z-0">
              <Image
                src={`https://picsum.photos/seed/${dateSeed}/1000/800`}
                alt="Daily Landscape"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                data-ai-hint="mountain landscape"
                priority
              />
              <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-[2px]" />
            </div>
          )}
          <CardContent className="relative z-10 p-0 overflow-hidden">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      <div className="px-1">
        <Accordion type="multiple" defaultValue={["ingredients", "recipes"]} className="w-full space-y-4 border-none">
          <AccordionItem value="ingredients" className="border-none glass rounded-[2rem] overflow-hidden px-4">
            <AccordionTrigger className="hover:no-underline py-6">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">{t('pantry.dailyIngredients')}</h2>
                </div>
                <Badge variant="outline" className="rounded-full border-primary/30 text-[10px] font-bold bg-primary/5">
                  {dayItems.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="grid grid-cols-1 gap-3 pt-2">
                {dayItems.length === 0 ? (
                  <div className="py-8 text-center bg-primary/5 rounded-2xl flex flex-col items-center justify-center space-y-2 opacity-50">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">{t('pantry.emptyDay')}</p>
                  </div>
                ) : (
                  dayItems.map((item) => (
                    <Card key={item.id} className="border-none bg-white/40 dark:bg-black/20 group hover:scale-[1.01] transition-all rounded-2xl overflow-hidden shadow-sm">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg text-foreground/90">{t(item.name)}</p>
                          <p className="text-[10px] uppercase font-bold text-primary tracking-wider">{t(item.quantity)}</p>
                        </div>
                        {isToday && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recipes" className="border-none glass rounded-[2rem] overflow-hidden px-4">
            <AccordionTrigger className="hover:no-underline py-6">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-secondary" />
                  <h2 className="text-lg font-bold">{t('pantry.dailyRecipes')}</h2>
                </div>
                <Badge variant="outline" className="rounded-full border-secondary/30 text-[10px] font-bold bg-secondary/5">
                  {dayRecipes.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="grid grid-cols-1 gap-3 pt-2">
                {dayRecipes.length === 0 ? (
                  <div className="py-8 text-center bg-secondary/5 rounded-2xl flex flex-col items-center justify-center space-y-2 opacity-50">
                    <ChefHat className="h-8 w-8 text-muted-foreground" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">{t('pantry.noRecipesDay')}</p>
                  </div>
                ) : (
                  dayRecipes.map((recipe) => (
                    <Card key={recipe.id} className="border-none bg-secondary/5 group transition-all rounded-2xl overflow-hidden shadow-sm">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-bold text-base leading-tight group-hover:text-secondary transition-colors">{recipe.name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-medium mt-1">
                            {language === 'english' ? 'Generated by FoodAI' : 'Generada por FoodAI'}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-secondary/20 text-secondary border-none flex items-center gap-1.5 h-8 px-3 rounded-full">
                          <Timer className="h-3.5 w-3.5" />
                          <span className="text-xs font-bold">{recipe.prepTime} min</span>
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}


