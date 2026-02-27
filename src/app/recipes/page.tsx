
"use client";

import { useState, useRef } from "react";
import { personalizedRecipeGeneration, PersonalizedRecipeGenerationOutput } from "@/ai/flows/ai-personalized-recipe-generation";
import { aiRecipeAudio } from "@/ai/flows/ai-recipe-audio-flow";
import { usePantry } from "@/lib/pantry-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChefHat, Timer, Users, Sparkles, Loader2, Play, CheckCircle2, ListFilter, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function RecipesPage() {
  const { items } = usePantry();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState<number | null>(null);
  const [recipes, setRecipes] = useState<PersonalizedRecipeGenerationOutput | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateRecipes = async () => {
    setLoading(true);
    setRecipes(null);
    try {
      const result = await personalizedRecipeGeneration({
        ingredients: items.map(i => i.name),
        numberOfPeople: 2,
        complexityLevel: 'simple',
        availableTimeMinutes: 30
      });
      setRecipes(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No pudimos generar recetas ahora mismo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleListen = async (idx: number, recipe: any) => {
    if (audioLoading !== null) return;
    
    setAudioLoading(idx);
    try {
      const savedVoice = localStorage.getItem('foodai_voice') || 'Algenib';
      const savedLang = localStorage.getItem('foodai_lang') || 'spanish-la';
      
      let langCode = 'es-LA';
      if (savedLang === 'english') langCode = 'en-US';
      if (savedLang === 'spanish-es') langCode = 'es-ES';

      const fullText = `Receta: ${recipe.name}. ${recipe.description}. Ingredientes: ${recipe.ingredientsNeeded.join(", ")}. Instrucciones: ${recipe.instructions.join(". ")}`;
      
      const { audioDataUri } = await aiRecipeAudio({
        text: fullText,
        voiceName: savedVoice,
        languageCode: langCode
      });

      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = audioDataUri;
      audioRef.current.play();
      
      audioRef.current.onended = () => setAudioLoading(null);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de Audio",
        description: "No se pudo generar el audio de la receta.",
        variant: "destructive"
      });
      setAudioLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Recetas</h1>
          <p className="text-muted-foreground text-sm">Personalizadas para ti.</p>
        </div>
        <Button variant="outline" size="icon" className="rounded-full">
          <ListFilter className="h-5 w-5" />
        </Button>
      </header>

      {!recipes && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-secondary/20 rounded-[2rem]">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ChefHat className="h-10 w-10" />
          </div>
          <div className="space-y-2 px-6">
            <h3 className="text-xl font-bold">¿Qué quieres comer?</h3>
            <p className="text-sm text-muted-foreground">Analizaremos tus {items.length} ingredientes para darte la mejor opción.</p>
          </div>
          <Button onClick={generateRecipes} className="rounded-full bg-primary px-8 h-12 shadow-lg hover:scale-105 transition-transform">
            Generar Sugerencias <Sparkles className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-primary animate-pulse">Cocinando ideas con IA...</p>
        </div>
      )}

      {recipes && (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-700">
          <div className="flex items-center gap-2 px-1">
             <Badge className="bg-accent text-accent-foreground">IA Curated</Badge>
             <p className="text-xs text-muted-foreground">Basado en tus preferencias actuales</p>
          </div>
          
          <div className="space-y-6">
            {recipes.recipes.map((recipe, idx) => (
              <Card key={idx} className="overflow-hidden border-none shadow-xl bg-white ring-1 ring-border/50 group/card">
                <div className="relative h-48 w-full bg-primary/5 overflow-hidden">
                   <img 
                    src={`https://picsum.photos/seed/recipe-${idx}/600/400`} 
                    alt={recipe.name} 
                    className="object-cover w-full h-full opacity-90 transition-transform duration-700 group-hover/card:scale-110"
                   />
                   <div className="absolute top-4 right-4 flex gap-2">
                      <Badge className="bg-white/90 backdrop-blur-sm text-primary flex gap-1 items-center">
                        <Timer className="h-3 w-3" /> {recipe.cookTimeMinutes + recipe.prepTimeMinutes} min
                      </Badge>
                   </div>
                   <Button 
                    size="icon" 
                    className={cn(
                      "absolute bottom-4 right-4 rounded-full shadow-lg transition-all",
                      audioLoading === idx ? "bg-accent animate-pulse" : "bg-primary"
                    )}
                    onClick={() => handleListen(idx, recipe)}
                    disabled={audioLoading !== null}
                   >
                     {audioLoading === idx ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                   </Button>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary">{recipe.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{recipe.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="space-y-3">
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" /> Ingredientes necesarios
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {recipe.ingredientsNeeded.map((ing, i) => (
                          <Badge key={i} variant="secondary" className="font-normal">{ing}</Badge>
                        ))}
                      </div>
                   </div>

                   {activeRecipe === idx ? (
                      <div className="space-y-4 pt-4 border-t animate-in fade-in duration-500">
                        <h4 className="font-bold text-sm">Pasos de preparación</h4>
                        <ol className="space-y-4">
                          {recipe.instructions.map((step, sIdx) => (
                            <li key={sIdx} className="flex gap-4">
                              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                                {sIdx + 1}
                              </span>
                              <p className="text-sm text-muted-foreground">{step}</p>
                            </li>
                          ))}
                        </ol>
                        <Button className="w-full bg-green-500 hover:bg-green-600 rounded-2xl" onClick={() => {
                          toast({ title: "¡Buen provecho!", description: "Ingredientes descontados de tu inventario." });
                          setRecipes(null);
                        }}>
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Terminar Receta
                        </Button>
                      </div>
                   ) : (
                      <Button className="w-full rounded-2xl bg-primary shadow-lg" onClick={() => setActiveRecipe(idx)}>
                        <Play className="h-4 w-4 mr-2" /> Empezar a Cocinar
                      </Button>
                   )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Button variant="ghost" className="w-full text-muted-foreground" onClick={generateRecipes}>
             Refrescar sugerencias
          </Button>
        </div>
      )}
    </div>
  );
}
