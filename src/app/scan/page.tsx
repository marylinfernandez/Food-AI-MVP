"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, Loader2, Refrigerator, CheckCircle2, Sparkles, Plus } from "lucide-react";
import { aiIngredientIdentification, IngredientIdentificationOutput } from "@/ai/flows/ai-ingredient-identification";
import { usePantry } from "@/lib/pantry-store";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function ScanPage() {
  const { toast } = useToast();
  const { addItem } = usePantry();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<IngredientIdentificationOutput | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      setPreview(dataUri);
      identify(dataUri);
    };
    reader.readAsDataURL(file);
  };

  const identify = async (dataUri: string) => {
    setLoading(true);
    setResults(null);
    try {
      const output = await aiIngredientIdentification({
        mediaDataUri: dataUri,
        description: "Fridge contents scan"
      });
      setResults(output);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de Escaneo",
        description: "No pudimos procesar la imagen. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addAllToPantry = () => {
    if (!results) return;
    results.identifiedIngredients.forEach(ing => {
      addItem({ name: ing.name, quantity: ing.quantity || "1 unidad" });
    });
    toast({
      title: "Pantry Actualizado",
      description: `${results.identifiedIngredients.length} ingredientes añadidos.`,
    });
    setResults(null);
    setPreview(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
          <Camera className="h-6 w-6" /> Escáner de Ingredientes
        </h1>
        <p className="text-sm text-muted-foreground">Sube una foto de tu nevera o despensa.</p>
      </div>

      {!preview ? (
        <Card className="border-dashed border-2 flex flex-col items-center justify-center p-12 space-y-4 hover:border-primary transition-colors cursor-pointer relative bg-secondary/20">
          <input
            type="file"
            accept="image/*,video/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-bold">Subir foto o vídeo</p>
            <p className="text-xs text-muted-foreground">Se verá como magia</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="overflow-hidden border-none shadow-xl">
            <div className="relative h-64 w-full bg-black">
              <Image src={preview} alt="Preview" fill className="object-contain" />
              {loading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-accent" />
                  <p className="text-sm font-medium animate-pulse">Analizando ingredientes...</p>
                </div>
              )}
            </div>
          </Card>

          {results && (
            <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
              <Card className="border-accent/30 bg-accent/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    Identificamos {results.identifiedIngredients.length} items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <p className="text-sm text-muted-foreground italic">"{results.summary}"</p>
                   <div className="grid grid-cols-1 gap-2">
                     {results.identifiedIngredients.map((ing, idx) => (
                       <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-border/50">
                         <div>
                            <p className="font-bold text-sm">{ing.name}</p>
                            <p className="text-[10px] text-muted-foreground">{ing.quantity || 'Cantidad desconocida'}</p>
                         </div>
                         <div className="flex items-center gap-2">
                           <Badge variant="outline" className="text-[10px] py-0">{Math.round(ing.confidence * 100)}% conf.</Badge>
                           <CheckCircle2 className="h-4 w-4 text-green-500" />
                         </div>
                       </div>
                     ))}
                   </div>
                </CardContent>
                <CardFooter>
                   <Button className="w-full rounded-2xl bg-primary shadow-lg" onClick={addAllToPantry}>
                     Añadir todo a mi despensa
                   </Button>
                </CardFooter>
              </Card>

              <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => {setPreview(null); setResults(null);}}>
                Escanear otra foto
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="bg-secondary/30 rounded-3xl p-6 text-center">
        <Refrigerator className="h-10 w-10 mx-auto text-primary/50 mb-2" />
        <h3 className="font-bold text-sm">Consejo Profesional</h3>
        <p className="text-[11px] text-muted-foreground">Para mejores resultados, asegúrate de que haya buena iluminación y que las etiquetas de los productos sean visibles.</p>
      </div>
    </div>
  );
}
