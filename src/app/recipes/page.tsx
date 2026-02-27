"use client";

import { useState, useRef } from "react";
import { personalizedRecipeGeneration, PersonalizedRecipeGenerationOutput } from "@/ai/flows/ai-personalized-recipe-generation";
import { aiRecipeAudio } from "@/ai/flows/ai-recipe-audio-flow";
import { usePantry } from "@/lib/pantry-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Users, Sparkles, Loader2, Play, CheckCircle2, Volume2, Beer, Utensils, IceCream, Coffee, ArrowLeft, ChevronRight, Mic, ShoppingCart, CheckCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/context/language-context";
import { Textarea } from "@/components/ui/textarea";

type Category = 'main' | 'drink' | 'dessert' | 'snack' | 'custom' | null;

export default function RecipesPage() {
  const { items } = usePantry();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState<number | null>(null);
  const [recipes, setRecipes] = useState<PersonalizedRecipeGenerationOutput | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [subCategory, setSubCategory] = useState<string>("");
  const [specificRequest, setSpecificRequest] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const categories = [
    { id: 'main', label: t('recipes.main'), icon: Utensils, color: 'bg-blue-500' },
    { id: 'drink', label: t('recipes.drink'), icon: Beer, color: 'bg-orange-500' },
    { id: 'dessert', label: t('recipes.dessert'), icon: IceCream, color: 'bg-pink-500' },
    { id: 'snack', label: t('recipes.snack'), icon: Coffee, color: 'bg-purple-500' },
    { id: 'custom', label: t('recipes.custom'), icon: Search, color: 'bg-emerald-500' },
  ];

  const drinkOptions = [
    { id: 'jugo', label: language === 'english' ? 'Fresh Juice' : 'Jugo Natural' },
    { id: 'cocktail-alc', label: language === 'english' ? 'Alcoholic Cocktail' : 'Cóctel con Alcohol' },
    { id: 'cocktail-no-alc', label: language === 'english' ? 'Mocktail' : 'Cóctel sin Alcohol' },
    { id: 'smoothie', label: language === 'english' ? 'Smoothie' : 'Batido / Smoothie' },
  ];

  const generateRecipes = async () => {
    if (!selectedCategory) return;
    
    setLoading(true);
    setRecipes(null);
    try {
      let mealTypeLabel = categories.find(c => c.id === selectedCategory)?.label || "";
      if (selectedCategory === 'drink' && subCategory) {
        mealTypeLabel += `: ${drinkOptions.find(o => o.id === subCategory)?.label}`;
      }

      const result = await personalizedRecipeGeneration({
        ingredients: items.map(i => i.name),
        numberOfPeople: 2,
        mealType: mealTypeLabel,
        specificRequest: selectedCategory === 'custom' ? specificRequest : undefined,
        language: language
      });
      setRecipes(result);
    } catch (error) {
      console.error(error);
      toast({
        title: t('Error'),
        description: t('recipes.errorGen'),
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
      
      let langCode = 'es-LA';
      if (language === 'english') langCode = 'en-US';
      if (language === 'spanish-es') langCode = 'es-ES';

      const introText = `${recipe.name}. ${recipe.description}.`;
      
      const ownedText = recipe.ingredientsOwned.length > 0 
        ? `${t('recipes.owned')}: ${recipe.ingredientsOwned.join(", ")}.` 
        : "";
      
      const missingText = recipe.ingredientsMissing.length > 0 
        ? `${t('recipes.missing')}: ${recipe.ingredientsMissing.join(", ")}.` 
        : "";

      const instructionsText = `${t('nav.recipes')}: ${recipe.instructions.join(". ")}`;
      
      const fullText = `${introText} ${ownedText} ${missingText} ${instructionsText}`;
      
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
        title: t('Error'),
        description: t('recipes.errorAudio'),
        variant: "destructive"
      });
      setAudioLoading(null);
    }
  };

  const resetSelection = () => {
    setSelectedCategory(null);
    setSubCategory("");
    setRecipes(null);
    setActiveRecipe(null);
    setSpecificRequest("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">{t('recipes.title')}</h1>
          <p className="text-muted-foreground text-sm font-medium">{t('recipes.subtitle')}</p>
        </div>
        {(selectedCategory || recipes) && (
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/10" onClick={resetSelection}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
      </header>

      {!selectedCategory && !loading && (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
          <div className="glass p-6 rounded-[2rem] border-none text-center space-y-2">
            <h2 className="text-xl font-bold">{t('recipes.question')}</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{t('recipes.category')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Card 
                key={cat.id} 
                className={cn(
                  "glass border-none hover:scale-105 transition-all cursor-pointer group overflow-hidden",
                  cat.id === 'custom' && "col-span-2"
                )}
                onClick={() => setSelectedCategory(cat.id as Category)}
              >
                <CardContent className="p-6 flex flex-col items-center gap-3">
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg", cat.color)}>
                    <cat.icon className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-bold text-sm text-center">{cat.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedCategory && !recipes && !loading && (
        <div className="space-y-8 animate-in zoom-in duration-300">
          <Card className="glass border-none overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">
                {selectedCategory === 'custom' ? t('recipes.custom') : categories.find(c => c.id === selectedCategory)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {selectedCategory !== 'custom' ? (
                <div className="space-y-6">
                  <p className="text-center text-xs text-muted-foreground leading-relaxed italic">
                    {language === 'english' 
                      ? 'FoodAI will create recipes using strictly what you have in your pantry.' 
                      : 'FoodAI creará recetas usando estrictamente lo que tienes en tu despensa.'}
                  </p>
                  
                  {selectedCategory === 'drink' && (
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('recipes.drinkType')}</label>
                      <Select onValueChange={setSubCategory}>
                        <SelectTrigger className="h-14 rounded-2xl border-white/10 glass">
                          <SelectValue placeholder={language === 'english' ? 'Select type...' : 'Selecciona el tipo...'} />
                        </SelectTrigger>
                        <SelectContent className="glass rounded-xl border-white/10">
                          {drinkOptions.map(opt => (
                            <SelectItem key={opt.id} value={opt.id} className="rounded-lg">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {language === 'english' ? 'Describe your craving...' : 'Describe tu antojo...'}
                    </label>
                    <div className="relative">
                      <Textarea 
                        placeholder={language === 'english' ? 'E.g. I want a lasagna with lots of cheese' : 'Ej. Quiero una lasaña con mucho queso'}
                        className="min-h-[120px] rounded-2xl glass border-white/10 p-4 text-lg"
                        value={specificRequest}
                        onChange={(e) => setSpecificRequest(e.target.value)}
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute bottom-3 right-3 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all h-12 w-12"
                        onClick={() => toast({ title: "Micrófono FoodAI", description: "Grabación de voz activa... (Simulación)" })}
                      >
                        <Mic className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={generateRecipes} 
                disabled={(selectedCategory === 'custom' && !specificRequest) || (selectedCategory === 'drink' && !subCategory)}
                className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl transition-all hover:scale-[1.02]"
              >
                {t('recipes.generate')} <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-accent animate-bounce" />
          </div>
          <p className="text-xl font-bold text-primary animate-pulse tracking-tighter">{t('recipes.cooking')}</p>
        </div>
      )}

      {recipes && (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-700">
          <div className="flex items-center justify-between px-1">
             <Badge className="bg-accent text-accent-foreground py-1 px-3">IA Analysis • {recipes.recipes.length} {language === 'english' ? 'options' : 'opciones'}</Badge>
          </div>
          
          <div className="space-y-6">
            {recipes.recipes.map((recipe, idx) => (
              <Card key={idx} className="overflow-hidden border-none shadow-xl glass group/card">
                <div className="relative h-56 w-full bg-primary/5">
                   <img 
                    src={`https://picsum.photos/seed/${encodeURIComponent(recipe.imageSearchTerm || recipe.name)}/600/400`} 
                    alt={recipe.name} 
                    className="object-cover w-full h-full opacity-90 transition-transform duration-700 group-hover/card:scale-110"
                    data-ai-hint={recipe.imageSearchTerm}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                   <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold leading-tight">{recipe.name}</h3>
                   </div>
                   <Button 
                    size="icon" 
                    className={cn(
                      "absolute bottom-4 right-4 rounded-full shadow-lg transition-all border-none h-12 w-12",
                      audioLoading === idx ? "bg-accent animate-pulse" : "bg-primary"
                    )}
                    onClick={() => handleListen(idx, recipe)}
                    disabled={audioLoading !== null}
                   >
                     {audioLoading === idx ? <Loader2 className="h-6 w-6 animate-spin" /> : <Volume2 className="h-6 w-6" />}
                   </Button>
                </div>
                <CardContent className="p-6 space-y-6">
                   <p className="text-sm text-muted-foreground leading-relaxed italic">"{recipe.description}"</p>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-bold text-[10px] uppercase tracking-widest text-green-500 flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" /> {t('recipes.owned')}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {recipe.ingredientsOwned.length > 0 ? recipe.ingredientsOwned.map((ing, i) => (
                            <Badge key={i} variant="outline" className="text-[9px] border-green-500/30 bg-green-500/5 text-green-600">{t(ing)}</Badge>
                          )) : <span className="text-[9px] text-muted-foreground opacity-50">None</span>}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-bold text-[10px] uppercase tracking-widest text-red-500 flex items-center gap-2">
                          <ShoppingCart className="h-3 w-3" /> {t('recipes.missing')}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {recipe.ingredientsMissing.length > 0 ? recipe.ingredientsMissing.map((ing, i) => (
                            <Badge key={i} variant="outline" className="text-[9px] border-red-500/30 bg-red-500/5 text-red-600">{t(ing)}</Badge>
                          )) : <span className="text-[9px] text-muted-foreground opacity-50">None</span>}
                        </div>
                      </div>
                   </div>

                   {activeRecipe === idx ? (
                      <div className="space-y-6 pt-6 border-t border-white/10 animate-in fade-in duration-500">
                        <ol className="space-y-4">
                          {recipe.instructions.map((step, sIdx) => (
                            <li key={sIdx} className="flex gap-4 group">
                              <span className="flex-shrink-0 h-7 w-7 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{sIdx + 1}</span>
                              <p className="text-sm text-muted-foreground">{step}</p>
                            </li>
                          ))}
                        </ol>
                        <Button className="w-full h-14 bg-green-500 hover:bg-green-600 rounded-2xl font-bold shadow-lg" onClick={() => {
                          toast({ title: language === 'english' ? 'Enjoy your meal!' : '¡Buen provecho!', description: language === 'english' ? 'Recipe completed.' : 'Receta completada.' });
                          setRecipes(null);
                        }}>
                          <CheckCircle2 className="h-5 w-5 mr-2" /> {t('recipes.finish')}
                        </Button>
                      </div>
                   ) : (
                      <Button className="w-full h-14 rounded-2xl bg-primary shadow-lg font-bold" onClick={() => setActiveRecipe(idx)}>
                        <Play className="h-5 w-5 mr-2" /> {t('recipes.start')}
                      </Button>
                   )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
