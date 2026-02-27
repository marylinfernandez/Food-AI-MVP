"use client";

import { usePantry } from "@/lib/pantry-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ChefHat, Timer, Sparkles, Trash2, Calendar as CalendarIcon, History } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/context/language-context";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function PantryPage() {
  const { items, historyRecipes, removeItem } = usePantry();
  const { t, language } = useTranslation();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Filtrar items por el día seleccionado
  const dayItems = items.filter(item => {
    if (!date) return false;
    const itemDate = new Date(item.scannedAt);
    return itemDate.toDateString() === date.toDateString();
  });

  // Filtrar recetas por el día seleccionado
  const dayRecipes = historyRecipes.filter(recipe => {
    if (!date) return false;
    const recipeDate = new Date(recipe.scannedAt);
    return recipeDate.toDateString() === date.toDateString();
  });

  const isToday = date?.toDateString() === new Date().toDateString();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="px-2 space-y-1">
        <h1 className="text-3xl font-bold text-primary tracking-tight">{t('pantry.title')}</h1>
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-70">
            {isToday ? t('pantry.subtitle') : t('pantry.historyMode')}
          </p>
        </div>
      </header>

      {/* Calendario Inmersivo */}
      <Card className="glass border-none overflow-hidden shadow-2xl neo-glow-primary/10">
        <CardContent className="p-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="w-full"
          />
        </CardContent>
      </Card>

      <div className="space-y-8 px-1">
        {/* Sección de Ingredientes del Día */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {t('pantry.dailyIngredients')}
            </h2>
            <Badge variant="outline" className="rounded-full border-primary/30 text-[10px] font-bold bg-primary/5">
              {dayItems.length} {t('home.ingredients')}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {dayItems.length === 0 ? (
              <div className="py-12 text-center glass rounded-[2rem] border-white/5 flex flex-col items-center justify-center space-y-2 opacity-50">
                <Package className="h-8 w-8 text-muted-foreground" />
                <p className="text-[10px] font-bold uppercase tracking-widest">{t('pantry.emptyDay')}</p>
              </div>
            ) : (
              dayItems.map((item) => (
                <Card key={item.id} className="border-none glass group hover:scale-[1.01] transition-all rounded-2xl overflow-hidden">
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
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Historial de Recetas del Día */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-secondary" />
              {t('pantry.dailyRecipes')}
            </h2>
            <Badge variant="outline" className="rounded-full border-secondary/30 text-[10px] font-bold bg-secondary/5">
              {dayRecipes.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {dayRecipes.length === 0 ? (
              <div className="py-12 text-center glass rounded-[2rem] border-white/5 flex flex-col items-center justify-center space-y-2 opacity-50">
                <ChefHat className="h-8 w-8 text-muted-foreground" />
                <p className="text-[10px] font-bold uppercase tracking-widest">{t('pantry.noRecipesDay')}</p>
              </div>
            ) : (
              dayRecipes.map((recipe) => (
                <Card key={recipe.id} className="border-none glass bg-secondary/5 group transition-all rounded-2xl overflow-hidden">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-bold text-base leading-tight group-hover:text-secondary transition-colors">{recipe.name}</p>
                      <p className="text-[9px] text-muted-foreground uppercase font-medium mt-1">Generada por FoodAI</p>
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
        </section>
      </div>

      {isToday && dayItems.length > 0 && (
        <section className="px-1 pt-4 pb-4">
          <div className="glass border-primary/20 rounded-[2rem] p-6 flex items-center gap-4 relative overflow-hidden neo-glow-primary/20 shadow-xl">
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full -mr-12 -mt-12"></div>
             <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
               <Sparkles className="h-8 w-8 text-primary animate-pulse" />
             </div>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{t('pantry.aiInsight')}</p>
               <p className="text-sm font-bold leading-tight">{t('pantry.readyToCook')}</p>
             </div>
          </div>
        </section>
      )}
    </div>
  );
}
