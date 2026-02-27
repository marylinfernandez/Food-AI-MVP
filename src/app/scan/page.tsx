"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Loader2, Refrigerator, CheckCircle2, Sparkles, RefreshCw, X, ChefHat } from "lucide-react";
import { aiIngredientIdentification, IngredientIdentificationOutput } from "@/ai/flows/ai-ingredient-identification";
import { usePantry } from "@/lib/pantry-store";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function ScanPage() {
  const { toast } = useToast();
  const { addItem } = usePantry();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<IngredientIdentificationOutput | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acceso a Cámara Denegado',
          description: 'Por favor, activa los permisos de cámara en tu navegador para usar el escáner.',
        });
      }
    };

    if (!preview && !results) {
      getCameraPermission();
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [preview, results]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setPreview(dataUri);
        identify(dataUri);
      }
    }
  };

  const identify = async (dataUri: string) => {
    setLoading(true);
    setResults(null);
    try {
      const output = await aiIngredientIdentification({
        mediaDataUri: dataUri,
        description: "Análisis de nevera en tiempo real"
      });
      setResults(output);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de Escaneo",
        description: "La IA no pudo procesar la imagen. Intenta capturar de nuevo con mejor luz.",
        variant: "destructive"
      });
      setPreview(null);
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
      title: "Despensa Actualizada",
      description: `Se han añadido ${results.identifiedIngredients.length} ingredientes correctamente.`,
    });
    resetScanner();
  };

  const resetScanner = () => {
    setResults(null);
    setPreview(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
          <Camera className="h-8 w-8 animate-pulse text-accent" /> Visión FoodAI
        </h1>
        <p className="text-sm text-muted-foreground uppercase tracking-widest opacity-70">Escáner en tiempo real</p>
      </div>

      {!preview ? (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl glass bg-black group">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover" 
              autoPlay 
              muted 
              playsInline 
            />
            
            {/* Overlay de HUD Futurista */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 border-t-2 border-l-2 border-accent w-8 h-8 rounded-tl-lg" />
              <div className="absolute top-4 right-4 border-t-2 border-r-2 border-accent w-8 h-8 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 border-b-2 border-l-2 border-accent w-8 h-8 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 border-b-2 border-r-2 border-accent w-8 h-8 rounded-br-lg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border border-white/20 rounded-full animate-ping opacity-20" />
              </div>
            </div>

            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                <Alert variant="destructive" className="bg-destructive/20 border-destructive">
                  <AlertTitle>Cámara Bloqueada</AlertTitle>
                  <AlertDescription>
                    No podemos acceder a la cámara. Por favor, verifica los permisos en tu navegador.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <Button 
            className="w-full h-20 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-bold text-xl shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.02]"
            onClick={capturePhoto}
            disabled={hasCameraPermission === false}
          >
            <Camera className="h-8 w-8 mr-3" /> ANALIZAR AHORA
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="overflow-hidden border-none shadow-2xl glass relative">
            <div className="relative h-72 w-full bg-black">
              <Image src={preview} alt="Captured" fill className="object-contain" />
              
              {loading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white gap-4">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-accent" />
                    <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-bounce" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xl font-bold tracking-tighter animate-pulse text-accent">IDENTIFICANDO...</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] opacity-60">IA de Visión Activa</p>
                  </div>
                  {/* Línea de escaneo láser */}
                  <div className="absolute left-0 right-0 h-1 bg-accent/50 shadow-[0_0_15px_rgba(var(--accent),0.8)] animate-[scan_2s_infinite]" />
                </div>
              )}
            </div>
          </Card>

          {results && (
            <div className="space-y-4 animate-in slide-in-from-bottom duration-700">
              <Card className="border-accent/30 bg-accent/5 glass">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-accent" />
                      Análisis Completado
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={resetScanner} className="rounded-full">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10 italic text-sm">
                     "{results.summary}"
                   </div>

                   <div className="grid grid-cols-1 gap-3">
                     {results.identifiedIngredients.map((ing, idx) => (
                       <div key={idx} className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm group hover:bg-white/20 transition-all">
                         <div className="flex flex-col">
                            <p className="font-bold text-lg leading-tight">{ing.name}</p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{ing.quantity || 'Cantidad aproximada'}</p>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                           <Badge variant="outline" className="text-[10px] bg-accent/10 border-accent/20 text-accent">
                             {Math.round(ing.confidence * 100)}% Prob.
                           </Badge>
                           <CheckCircle2 className="h-5 w-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                         </div>
                       </div>
                     ))}
                   </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                   <Button className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl" onClick={addAllToPantry}>
                     GUARDAR EN MI DESPENSA
                   </Button>
                   <Link href="/recipes" className="w-full">
                    <Button variant="outline" className="w-full h-12 rounded-2xl border-accent/30 text-accent hover:bg-accent/10">
                      <ChefHat className="h-5 w-5 mr-2" /> SUGERIR RECETAS CON ESTO
                    </Button>
                   </Link>
                </CardFooter>
              </Card>

              <Button variant="ghost" className="w-full h-12 text-muted-foreground flex gap-2" onClick={resetScanner}>
                <RefreshCw className="h-4 w-4" /> REINTENTAR ESCANEO
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10 flex items-start gap-4 glass">
        <div className="bg-accent/20 p-3 rounded-2xl">
          <Refrigerator className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Modo Laboratorio</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            La IA de FoodAI analiza texturas, formas y etiquetas para mantener tu inventario actualizado sin que tengas que escribir nada.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}
