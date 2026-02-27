
"use client";

import { usePantry } from "@/lib/pantry-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Package, ChefHat, Timer, History, Sparkles, Trash2 } from "lucide-react";
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      <header className="px-2">
        <h1 className="text-3xl font-bold text-primary tracking-tight">{t('pantry.title')}</h1>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-70">
          {isToday ? t('pantry.subtitle') : t('pantry.historyMode')}
        </p>
      </header>

      {/* Calendario Inmersivo */}
      <Card className="glass border-none overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-none border-none p-4"
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
            <Badge variant="outline" className="rounded-full border-primary/30 text-[10px] font-bold">
              {dayItems.length} {t('home.ingredients')}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {dayItems.length === 0 ? (
              <div className="py-10 text-center glass rounded-2xl border-white/5 opacity-40">
                <p className="text-xs font-bold uppercase tracking-widest">{t('pantry.emptyDay')}</p>
              </div>
            ) : (
              dayItems.map((item) => (
                <Card key={item.id} className="border-none glass group hover:scale-[1.01] transition-all">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg">{t(item.name)}</p>
                      <p className="text-[10px] uppercase font-bold text-primary tracking-wider">{t(item.quantity)}</p>
                    </div>
                    {isToday && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full text-muted-foreground hover:text-destructive"
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
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-secondary" />
            {t('pantry.dailyRecipes')}
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {dayRecipes.length === 0 ? (
              <div className="py-10 text-center glass rounded-2xl border-white/5 opacity-40">
                <p className="text-xs font-bold uppercase tracking-widest">{t('pantry.noRecipesDay')}</p>
              </div>
            ) : (
              dayRecipes.map((recipe) => (
                <Card key={recipe.id} className="border-none glass bg-secondary/5 group transition-all">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-bold text-base leading-tight group-hover:text-secondary transition-colors">{recipe.name}</p>
                    </div>
                    <Badge variant="secondary" className="bg-secondary/20 text-secondary border-none flex items-center gap-1.5 h-8">
                      <Timer className="h-3.5 w-3.5" />
                      <span className="text-xs">{recipe.prepTime} min</span>
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>

      {isToday && dayItems.length > 0 && (
        <section className="px-1 pt-4">
          <div className="glass border-primary/20 rounded-[2rem] p-6 flex items-center gap-4 relative overflow-hidden">
             <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
               <Sparkles className="h-6 w-6 text-primary animate-pulse" />
             </div>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{t('pantry.aiInsight')}</p>
               <p className="text-sm font-bold">{t('pantry.readyToCook')}</p>
             </div>
          </div>
        </section>
      )}
    </div>
  );
}
