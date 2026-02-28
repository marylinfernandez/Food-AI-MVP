
"use client";

import { useState, useRef, useEffect } from "react";
import { personalizedRecipeGeneration, PersonalizedRecipeGenerationOutput } from "@/ai/flows/ai-personalized-recipe-generation";
import { aiRecipeAudio } from "@/ai/flows/ai-recipe-audio-flow";
import { aiNearbyStores, NearbyStoresOutput } from "@/ai/flows/ai-nearby-stores-flow";
import { usePantry } from "@/lib/pantry-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Sparkles, Loader2, Play, CheckCircle2, Volume2, Beer, Utensils, IceCream, Coffee, ArrowLeft, ChevronRight, Mic, ShoppingCart, CheckCircle, Search, MapPin, ExternalLink, Tag, TrendingUp, MicOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/context/language-context";
import { Textarea } from "@/components/ui/textarea";
import { useTour } from "@/context/tour-context";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";

type Category = 'main' | 'drink' | 'dessert' | 'snack' | 'custom' | null;

export default function RecipesPage() {
  const { items, addRecipeToHistory } = usePantry();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const { guideStep } = useTour();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState<number | null>(null);
  const [recipes, setRecipes] = useState<PersonalizedRecipeGenerationOutput | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [subCategory, setSubCategory] = useState<string>("");
  const [specificRequest, setSpecificRequest] = useState("");
  const [nearbyStores, setNearbyStores] = useState<NearbyStoresOutput | null>(null);
  const [storesLoading, setStoresLoading] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
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

    if (selectedCategory !== 'custom' && todayItems.length === 0) {
      toast({ 
        title: t('Error'), 
        description: language === 'english' ? "Scan your ingredients first!" : "¡Escanea tus ingredientes primero!", 
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
    if (!navigator.geolocation) return;
    setStoresLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const missing = recipes?.recipes[activeRecipe || 0]?.ingredientsMissing || [];
        const result = await aiNearbyStores({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, missingIngredients: missing, language: language });
        setNearbyStores(result);
      } catch (err) {
        toast({ title: "Error", variant: "destructive" });
      } finally {
        setStoresLoading(false);
      }
    });
  };

  const resetSelection = () => {
    setSelectedCategory(null);
    setRecipes(null);
    setActiveRecipe(null);
    setNearbyStores(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-3xl font-bold text-primary">{t('recipes.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('recipes.subtitle')}</p>
        </div>
        {(selectedCategory || recipes) && <Button variant="ghost" size="icon" onClick={resetSelection}><ArrowLeft /></Button>}
      </header>

      {!selectedCategory && !loading && (
        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className={cn("glass border-none cursor-pointer group", cat.id === 'custom' && "col-span-2")} onClick={() => setSelectedCategory(cat.id as Category)}>
              <CardContent className="p-6 flex flex-col items-center gap-3">
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-white", cat.color)}><cat.icon /></div>
                <span className="font-bold text-sm">{cat.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCategory && !recipes && !loading && (
        <Card className="glass border-none p-6 space-y-6">
          <h2 className="text-xl font-bold text-center">{categories.find(c => c.id === selectedCategory)?.label}</h2>
          {selectedCategory === 'custom' && <Textarea value={specificRequest} onChange={(e) => setSpecificRequest(e.target.value)} placeholder="¿Qué quieres cocinar?" />}
          <Button className="w-full h-14" onClick={generateRecipes}>{t('recipes.generate')}</Button>
        </Card>
      )}

      {loading && <div className="py-20 text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" /><p>{t('recipes.cooking')}</p></div>}

      {recipes && (
        <div className="space-y-6">
          {recipes.recipes.map((recipe, idx) => (
            <Card key={idx} className="glass border-none overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold">{recipe.name}</h3>
                <p className="text-sm italic">{recipe.description}</p>
                <div className="flex flex-wrap gap-2">
                  {recipe.instructions.map((step, i) => <p key={i} className="text-sm">{i+1}. {step}</p>)}
                </div>
                {recipe.ingredientsMissing.length > 0 && !nearbyStores && (
                  <Button variant="outline" className="w-full" onClick={handleNearbyStores}>{t('recipes.enableLocation')}</Button>
                )}
                {nearbyStores && activeRecipe === idx && (
                  <div className="space-y-2">
                    {nearbyStores.stores.map((s, i) => <div key={i} className="p-2 bg-white/10 rounded">{s.name} - {s.distance}</div>)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
