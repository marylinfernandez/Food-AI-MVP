"use client";

import { useState, useRef } from "react";
import { personalizedRecipeGeneration, PersonalizedRecipeGenerationOutput } from "@/ai/flows/ai-personalized-recipe-generation";
import { aiRecipeAudio } from "@/ai/flows/ai-recipe-audio-flow";
import { aiNearbyStores, NearbyStoresOutput } from "@/ai/flows/ai-nearby-stores-flow";
import { usePantry } from "@/lib/pantry-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Users, Sparkles, Loader2, Play, CheckCircle2, Volume2, Beer, Utensils, IceCream, Coffee, ArrowLeft, ChevronRight, Mic, ShoppingCart, CheckCircle, Search, MapPin, Clock, ExternalLink, Tag, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/context/language-context";
import { Textarea } from "@/components/ui/textarea";

type Category = 'main' | 'drink' | 'dessert' | 'snack' | 'custom' | null;

export default function RecipesPage() {
  const { items, addRecipeToHistory } = usePantry();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState<number | null>(null);
  const [recipes, setRecipes] = useState<PersonalizedRecipeGenerationOutput | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [subCategory, setSubCategory] = useState<string>("");
  const [specificRequest, setSpecificRequest] = useState("");
  const [nearbyStores, setNearbyStores] = useState<NearbyStoresOutput | null>(null);
  const [storesLoading, setStoresLoading] = useState(false);
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
    
    const todayStr = new Date().toDateString();
    const todayItems = items.filter(i => new Date(i.scannedAt).toDateString() === todayStr);

    if (todayItems.length === 0) {
      toast({
        title: t('Error'),
        description: language === 'english' ? "Please scan your ingredients for today first!" : "¡Por favor, escanea tus ingredientes de hoy primero!",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setRecipes(null);
    setNearbyStores(null);
    try {
      let mealTypeLabel = categories.find(c => c.id === selectedCategory)?.label || "";
      if (selectedCategory === 'drink' && subCategory) {
        mealTypeLabel += `: ${drinkOptions.find(o => o.id === subCategory)?.label}`;
      }

      const result = await personalizedRecipeGeneration({
        ingredients: todayItems.map(i => i.name),
        numberOfPeople: 2,
        mealType: mealTypeLabel,
        specificRequest: selectedCategory === 'custom' ? specificRequest : undefined,
        language: language
      });

      setRecipes(result);
      
      if (result.recipes.length > 0) {
        addRecipeToHistory({
          name: result.recipes[0].name,
          prepTime: result.recipes[0].prepTimeMinutes + result.recipes[0].cookTimeMinutes
        });
      }
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

  const handleNearbyStores = () => {
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocalización no soportada", variant: "destructive" });
      return;
    }

    setStoresLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const missing = recipes?.recipes[activeRecipe || 0]?.ingredientsMissing || [];
          const result = await aiNearbyStores({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            missingIngredients: missing,
            language: language
          });
          setNearbyStores(result);
        } catch (error) {
          toast({ title: "Error", description: "No se pudieron obtener tiendas", variant: "destructive" });
        } finally {
          setStoresLoading(false);
        }
      },
      (error) => {
        toast({ title: "Error de Ubicación", description: "No se pudo acceder a tu ubicación", variant: "destructive" });
        setStoresLoading(false);
      }
    );
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
      const ownedText = recipe.ingredientsOwned.length > 0 ? `${t('recipes.owned')}: ${recipe.ingredientsOwned.join(", ")}.` : "";
      const missingText = recipe.ingredientsMissing.length > 0 ? `${t('recipes.missing')}: ${recipe.ingredientsMissing.join(", ")}.` : "";
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
      toast({ title: t('Error'), description: t('recipes.errorAudio'), variant: "destructive" });
      setAudioLoading(null);
    }
  };

  const resetSelection = () => {
    setSelectedCategory(null);
    setSubCategory("");
    setRecipes(null);
    setActiveRecipe(null);
    setSpecificRequest("");
    setNearbyStores(null);
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
              <div className="space-y-6">
                <p className="text-center text-xs text-muted-foreground leading-relaxed italic">
                  {language === 'english' ? 'FoodAI will use your real-time pantry to suggest the best option.' : 'FoodAI usará tu despensa en tiempo real para sugerirte la mejor opción.'}
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
                          <SelectItem key={opt.id} value={opt.id} className="rounded-lg">{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {selectedCategory === 'custom' && (
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('recipes.customLabel')}</label>
                    <div className="relative">
                      <Textarea 
                        placeholder={language === 'english' ? 'E.g. I want something with pasta and chicken' : 'Ej. Quiero algo con pasta y pollo'}
                        className="min-h-[120px] rounded-2xl glass border-white/10 p-4"
                        value={specificRequest}
                        onChange={(e) => setSpecificRequest(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={generateRecipes} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl">
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
          {recipes.recipes.map((recipe, idx) => (
            <Card key={idx} className="overflow-hidden border-none shadow-xl glass group/card">
              <div className="relative h-56 w-full bg-primary/5">
                 <img 
                  src={`https://picsum.photos/seed/${encodeURIComponent(recipe.imageSearchTerm || recipe.name)}/600/400`} 
                  alt={recipe.name} 
                  className="object-cover w-full h-full transition-transform duration-700 group-hover/card:scale-110"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                 <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold">{recipe.name}</h3>
                 </div>
                 <Button 
                  size="icon" 
                  className={cn("absolute bottom-4 right-4 rounded-full shadow-lg transition-all h-12 w-12", audioLoading === idx ? "bg-accent animate-pulse" : "bg-primary")}
                  onClick={() => handleListen(idx, recipe)}
                  disabled={audioLoading !== null}
                 >
                   {audioLoading === idx ? <Loader2 className="h-6 w-6 animate-spin" /> : <Volume2 className="h-6 w-6" />}
                 </Button>
              </div>
              <CardContent className="p-6 space-y-6">
                 <p className="text-sm text-muted-foreground italic leading-relaxed">"{recipe.description}"</p>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-[10px] uppercase tracking-widest text-green-500 flex items-center gap-1.5"><CheckCircle className="h-3 w-3" /> {t('recipes.owned')}</h4>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredientsOwned.map((ing, i) => (
                          <Badge key={i} variant="outline" className="text-[8px] border-green-500/20 bg-green-500/5 text-green-600">{t(ing)}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-[10px] uppercase tracking-widest text-red-500 flex items-center gap-1.5"><ShoppingCart className="h-3 w-3" /> {t('recipes.missing')}</h4>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredientsMissing.map((ing, i) => (
                          <Badge key={i} variant="outline" className="text-[8px] border-red-500/20 bg-red-500/5 text-red-600">{t(ing)}</Badge>
                        ))}
                      </div>
                    </div>
                 </div>

                 {recipe.ingredientsMissing.length > 0 && !nearbyStores && (
                   <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 space-y-4 animate-in fade-in">
                     <div className="flex items-center gap-3">
                       <MapPin className="h-8 w-8 text-primary" />
                       <div>
                         <h4 className="font-bold text-sm">¿Te falta algo para esta receta?</h4>
                         <p className="text-xs text-muted-foreground">Compara precios y disponibilidad en tiendas cercanas.</p>
                       </div>
                     </div>
                     <Button variant="outline" className="w-full rounded-xl border-primary text-primary" onClick={() => { setActiveRecipe(idx); handleNearbyStores(); }} disabled={storesLoading}>
                       {storesLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                       Comparar Precios y Disponibilidad
                     </Button>
                   </div>
                 )}

                 {nearbyStores && activeRecipe === idx && (
                   <div className="space-y-4 animate-in slide-in-from-top duration-500">
                     <div className="flex items-center justify-between">
                       <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                         <TrendingUp className="h-4 w-4" /> Comparativa de Tiendas
                       </h4>
                       <Button variant="ghost" size="sm" className="h-8 text-[10px]" onClick={() => setNearbyStores(null)}>Cerrar</Button>
                     </div>
                     <div className="space-y-4">
                       {nearbyStores.stores.map((store, sIdx) => (
                         <Card key={sIdx} className="border-none glass bg-white/40 dark:bg-black/20 p-4 rounded-xl relative overflow-hidden">
                           <div className="flex justify-between items-start relative z-10">
                             <div>
                               <p className="font-bold text-sm">{store.name}</p>
                               <p className="text-[10px] text-muted-foreground">{store.address} • {store.distance}</p>
                             </div>
                             <Badge className="bg-primary/20 text-primary border-none text-[10px] font-bold">
                               Total: {store.totalEstimatedPrice}
                             </Badge>
                           </div>
                           
                           <div className="mt-4 grid grid-cols-1 gap-2 relative z-10">
                              {store.availability.map((prod, pIdx) => (
                                <div key={pIdx} className="flex justify-between items-center text-[10px] bg-white/20 p-2 rounded-lg">
                                  <span className="flex items-center gap-1.5">
                                    {prod.inStock ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Tag className="h-3 w-3 text-red-400" />}
                                    {prod.product}
                                  </span>
                                  <span className="font-bold">{prod.estimatedPrice}</span>
                                </div>
                              ))}
                           </div>

                           <Button 
                            className="w-full mt-4 h-10 rounded-xl bg-primary text-white font-bold text-xs gap-2 shadow-lg"
                            onClick={() => window.open(store.websiteSearchUrl, '_blank')}
                           >
                             Ver en la Tienda <ExternalLink className="h-3 w-3" />
                           </Button>
                         </Card>
                       ))}
                     </div>
                   </div>
                 )}

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
                      <Button className="w-full h-14 bg-green-500 hover:bg-green-600 rounded-2xl font-bold text-white shadow-lg" onClick={() => {
                        toast({ title: '¡Buen provecho!', description: 'Receta completada y guardada.' });
                        setRecipes(null);
                      }}>
                        <CheckCircle2 className="h-5 w-5 mr-2" /> FINALIZAR RECETA
                      </Button>
                    </div>
                 ) : (
                    <Button className="w-full h-14 rounded-2xl bg-primary shadow-lg font-bold text-white" onClick={() => setActiveRecipe(idx)}>
                      <Play className="h-5 w-5 mr-2" /> EMPEZAR A COCINAR
                    </Button>
                 )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
