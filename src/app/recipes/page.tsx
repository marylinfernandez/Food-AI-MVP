"use client";

import { useState, useRef, useEffect } from "react";
import { personalizedRecipeGeneration, PersonalizedRecipeGenerationOutput } from "@/ai/flows/ai-personalized-recipe-generation";
import { aiRecipeAudio } from "@/ai/flows/ai-recipe-audio-flow";
import { aiNearbyStores, NearbyStoresOutput } from "@/ai/flows/ai-nearby-stores-flow";
import { usePantry } from "@/lib/pantry-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, Sparkles, Loader2, Volume2, Utensils, Beer, IceCream, Coffee, ArrowLeft, ShoppingCart, CheckCircle, MapPin, ExternalLink, X, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/language-context";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";

type Category = 'main' | 'drink' | 'dessert' | 'snack' | 'custom' | null;

export default function RecipesPage() {
  const { items, addRecipeToHistory } = usePantry();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState<number | null>(null);
  const [recipes, setRecipes] = useState<PersonalizedRecipeGenerationOutput | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [specificRequest, setSpecificRequest] = useState("");
  const [nearbyStores, setNearbyStores] = useState<NearbyStoresOutput | null>(null);
  const [storesLoading, setStoresLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) return null;

  const categories = [
    { id: 'main', label: t('recipes.main'), icon: Utensils, color: 'bg-blue-500' },
    { id: 'drink', label: t('recipes.drink'), icon: Beer, color: 'bg-orange-500' },
    { id: 'dessert', label: t('recipes.dessert'), icon: IceCream, color: 'bg-pink-500' },
    { id: 'snack', label: t('recipes.snack'), icon: Coffee, color: 'bg-purple-500' },
    { id: 'custom', label: t('recipes.custom'), icon: Search, color: 'bg-emerald-500' },
  ];

  const handleReadRecipe = async (recipe: any, index: number) => {
    setAudioLoading(index);
    try {
      const textToRead = `${recipe.name}. ${recipe.description}. Instrucciones: ${recipe.instructions.join('. ')}`;
      
      const langCodeMap: Record<string, string> = {
        'english': 'en-US',
        'spanish-es': 'es-ES',
        'spanish-la': 'es-LA'
      };

      const result = await aiRecipeAudio({
        text: textToRead,
        languageCode: langCodeMap[language] || 'es-LA',
        voiceName: localStorage.getItem('foodai_voice') || 'Algenib'
      });

      if (audioRef.current) {
        audioRef.current.src = result.audioDataUri;
        audioRef.current.play();
      }
    } catch (error) {
      console.error(error);
      toast({ title: t('Error'), description: t('recipes.errorAudio'), variant: "destructive" });
    } finally {
      setAudioLoading(null);
    }
  };

  const generateRecipes = async () => {
    if (!selectedCategory) return;
    
    const todayStr = new Date().toDateString();
    const todayItems = items.filter(i => new Date(i.scannedAt).toDateString() === todayStr);

    if (selectedCategory !== 'custom' && todayItems.length === 0) {
      toast({ 
        title: language === 'english' ? "Ingredients Needed" : "Faltan ingredientes", 
        description: language === 'english' ? "Please scan your fridge first for this category!" : "¡Por favor escanea tu nevera primero para esta categoría!", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      let mealTypeLabel = categories.find(c => c.id === selectedCategory)?.label || "";
      const result = await personalizedRecipeGeneration({
        ingredients: todayItems.map(i => i.name),
        numberOfPeople: 2,
        mealType: mealTypeLabel,
        specificRequest: selectedCategory === 'custom' ? specificRequest : undefined,
        language: language
      });
      setRecipes(result);
      if (result.recipes.length > 0) {
        addRecipeToHistory({ name: result.recipes[0].name, prepTime: result.recipes[0].prepTimeMinutes + result.recipes[0].cookTimeMinutes });
      }
    } catch (error) {
      console.error(error);
      toast({ title: t('Error'), description: t('recipes.errorGen'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleNearbyStores = () => {
    if (!navigator.geolocation) {
      toast({ 
        title: "GPS no disponible", 
        description: "Tu navegador no soporta geolocalización.", 
        variant: "destructive" 
      });
      return;
    }

    setStoresLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const recipeIdx = activeRecipe !== null ? activeRecipe : 0;
          const missing = recipes?.recipes?.[recipeIdx]?.ingredientsMissing || [];
          
          const result = await aiNearbyStores({ 
            latitude: pos.coords.latitude, 
            longitude: pos.coords.longitude, 
            missingIngredients: missing, 
            language: language 
          });
          setNearbyStores(result);
        } catch (err) {
          toast({ 
            title: "Error de IA", 
            description: "No pudimos localizar tiendas ahora mismo.", 
            variant: "destructive" 
          });
        } finally {
          setStoresLoading(false);
        }
      },
      (error) => {
        setStoresLoading(false);
        let msg = "No se pudo obtener tu ubicación.";
        if (error.code === 1) msg = "Por favor, permite el acceso a tu ubicación.";
        toast({ title: "Error de GPS", description: msg, variant: "destructive" });
      },
      { timeout: 10000 }
    );
  };

  const resetSelection = () => {
    setSelectedCategory(null);
    setRecipes(null);
    setActiveRecipe(null);
    setNearbyStores(null);
    setSpecificRequest("");
    if (audioRef.current) audioRef.current.pause();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">{t('recipes.title')}</h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-70">{t('recipes.subtitle')}</p>
        </div>
        {(selectedCategory || recipes) && (
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-primary/10" onClick={resetSelection}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
      </header>

      <audio ref={audioRef} className="hidden" />

      {!selectedCategory && !loading && (
        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className={cn(
              "glass border-none cursor-pointer group hover:scale-[1.02] transition-all duration-300",
              cat.id === 'custom' && "col-span-2"
            )} onClick={() => setSelectedCategory(cat.id as Category)}>
              <div className="p-6 flex flex-col items-center gap-3">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg", cat.color)}>
                  <cat.icon className="h-7 w-7" />
                </div>
                <span className="font-bold text-sm uppercase tracking-wider">{cat.label}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedCategory && !recipes && !loading && (
        <Card className="glass border-none p-8 space-y-6 animate-in zoom-in duration-300">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-primary">{categories.find(c => c.id === selectedCategory)?.label}</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">FoodAI está listo para cocinar</p>
          </div>
          
          {selectedCategory === 'custom' && (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60 px-1">{t('recipes.customLabel')}</label>
              <Textarea 
                value={specificRequest} 
                onChange={(e) => setSpecificRequest(e.target.value)} 
                placeholder="Ej: Pasta carbonara para dos..." 
                className="rounded-2xl border-2 focus:ring-primary min-h-[120px]"
              />
            </div>
          )}
          
          <Button className="w-full h-16 rounded-2xl font-bold text-lg shadow-xl neo-glow-primary transition-all" onClick={generateRecipes}>
            <Sparkles className="h-5 w-5 mr-2" /> {t('recipes.generate')}
          </Button>
        </Card>
      )}

      {loading && (
        <div className="py-20 text-center space-y-6 animate-pulse">
          <div className="relative inline-block">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-accent animate-bounce" />
          </div>
          <p className="font-black uppercase tracking-[0.2em] text-sm text-primary">{t('recipes.cooking')}</p>
        </div>
      )}

      {recipes && (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
          {recipes.recipes.map((recipe, idx) => (
            <Card key={idx} className="glass border-none overflow-hidden relative group">
              <div className="h-48 relative">
                <img 
                  src={`https://picsum.photos/seed/${recipe.imageSearchTerm}/600/400`} 
                  alt={recipe.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 right-4">
                  <Button 
                    size="icon" 
                    className="rounded-full bg-white/20 backdrop-blur-md hover:bg-primary text-white border-white/20"
                    onClick={() => handleReadRecipe(recipe, idx)}
                    disabled={audioLoading === idx}
                  >
                    {audioLoading === idx ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <Badge className="bg-primary/90 text-white mb-2 h-5 px-2 text-[10px] font-bold border-none uppercase">
                    {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
                  </Badge>
                  <h3 className="text-xl font-bold leading-tight">{recipe.name}</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-sm text-muted-foreground italic leading-relaxed">"{recipe.description}"</p>
                
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">{t('recipes.owned')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {recipe.ingredientsOwned.map((ing, i) => (
                      <Badge key={i} variant="outline" className="rounded-lg border-primary/20 bg-primary/5 text-[10px] h-6">
                        <CheckCircle className="h-3 w-3 mr-1 text-primary" /> {ing}
                      </Badge>
                    ))}
                  </div>
                </div>

                {recipe.ingredientsMissing.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">{t('recipes.missing')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredientsMissing.map((ing, i) => (
                        <Badge key={i} variant="outline" className="rounded-lg border-red-500/20 bg-red-500/5 text-[10px] h-6 text-red-600">
                          <ShoppingCart className="h-3 w-3 mr-1" /> {ing}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                    <Utensils className="h-4 w-4" /> {t('recipes.start')}
                  </h4>
                  <div className="space-y-4">
                    {recipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-4 group/step">
                        <span className="h-6 w-6 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary font-black text-xs shrink-0 group-hover/step:bg-secondary group-hover/step:text-white transition-colors">
                          {i + 1}
                        </span>
                        <p className="text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {recipe.ingredientsMissing.length > 0 && !nearbyStores && (
                  <div className="pt-4 border-t border-dashed">
                    <Button 
                      variant="outline" 
                      className="w-full h-14 rounded-2xl border-2 border-accent text-accent font-bold hover:bg-accent/10" 
                      onClick={() => {
                        setActiveRecipe(idx);
                        handleNearbyStores();
                      }}
                      disabled={storesLoading}
                    >
                      {storesLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <MapPin className="h-5 w-5 mr-2" />}
                      {t('recipes.enableLocation')}
                    </Button>
                  </div>
                )}

                {nearbyStores && activeRecipe === idx && (
                  <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-accent" /> {t('recipes.storesTitle')}
                      </h4>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setNearbyStores(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {nearbyStores.stores.map((store, i) => (
                        <div key={i} className="p-4 bg-accent/5 rounded-2xl border border-accent/10 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-sm">{store.name}</p>
                              <p className="text-[10px] opacity-60 flex items-center gap-1"><MapPin className="h-2 w-2" /> {store.distance}</p>
                            </div>
                            <Badge className={store.isOpen ? "bg-green-500" : "bg-red-500"}>{store.isOpen ? "OPEN" : "CLOSED"}</Badge>
                          </div>
                          
                          <div className="space-y-1">
                            {store.availability.map((item, j) => (
                              <div key={j} className="flex justify-between text-[10px] font-bold">
                                <span>{item.product}</span>
                                <span className="text-accent">{item.estimatedPrice}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="pt-2 border-t border-accent/20 flex justify-between items-center">
                            <p className="text-xs font-black">TOTAL: {store.totalEstimatedPrice}</p>
                            <a href={store.websiteSearchUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="ghost" className="h-7 px-3 text-[10px] font-bold text-accent">
                                {language === 'english' ? 'VISIT STORE' : 'VISITAR TIENDA'} <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
