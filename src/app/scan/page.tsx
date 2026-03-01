"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Loader2, Refrigerator, ChefHat, Video, StopCircle, Radio, RefreshCw, X, AlertCircle, Sparkles } from "lucide-react";
import { aiIngredientIdentification, IngredientIdentificationOutput } from "@/ai/flows/ai-ingredient-identification";
import { usePantry } from "@/lib/pantry-store";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { useTranslation } from "@/context/language-context";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";

/**
 * @fileOverview Pantalla de escaneo optimizada para móviles. 
 * Usa cámara trasera por defecto y soporta foto/video con compatibilidad multiplataforma.
 */
export default function ScanPage() {
  const { toast } = useToast();
  const { addItem } = usePantry();
  const { t } = useTranslation();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<IngredientIdentificationOutput | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanMode, setScanMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (isUserLoading || !user) return;

    let currentStream: MediaStream | null = null;

    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        currentStream = stream;
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(err => console.error("Video play error:", err));
          };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    if (!preview && !results) {
      getCameraPermission();
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [preview, results, isUserLoading, user]);

  if (isUserLoading || !user) return null;

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Asegurar que el video está listo antes de capturar
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        toast({ 
          title: "Cámara no lista", 
          description: "Por favor espera un segundo a que la imagen se estabilice.", 
          variant: "destructive" 
        });
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const dataUri = canvas.toDataURL('image/jpeg', 0.8);
          setPreview(dataUri);
          identify(dataUri);
        } catch (e) {
          console.error("Canvas toDataURL Error:", e);
          toast({ title: "Error de captura", description: "No se pudo procesar la foto.", variant: "destructive" });
        }
      }
    }
  };

  const getSupportedMimeType = () => {
    const types = ['video/mp4', 'video/webm;codecs=vp8', 'video/webm', 'video/ogg'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

  const startRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      chunksRef.current = [];
      const stream = videoRef.current.srcObject as MediaStream;
      const mimeType = getSupportedMimeType();
      
      try {
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUri = reader.result as string;
            setPreview(dataUri);
            identify(dataUri);
          };
          reader.readAsDataURL(blob);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev >= 9) { // Máximo 10 segundos
              stopRecording();
              return 10;
            }
            return prev + 1;
          });
        }, 1000);

      } catch (e) {
        console.error("Error starting recorder:", e);
        toast({ title: "Error", description: "No se pudo iniciar la grabación de video.", variant: "destructive" });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const identify = async (dataUri: string) => {
    setLoading(true);
    setResults(null);
    try {
      const output = await aiIngredientIdentification({
        mediaDataUri: dataUri,
        description: `Análisis de ${scanMode === 'photo' ? 'foto' : 'video'} de nevera/despensa`
      });
      setResults(output);
    } catch (error) {
      console.error("AI identification error:", error);
      toast({
        title: "Error de Escaneo",
        description: "No se pudo identificar el contenido. Intenta con una toma más clara o mejor iluminación.",
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
    setIsRecording(false);
    setRecordingTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
          <Camera className="h-8 w-8 text-accent" /> {t('scan.title')}
        </h1>
        <p className="text-sm text-muted-foreground uppercase tracking-widest opacity-70 font-bold">{t('scan.subtitle')}</p>
      </div>

      {!preview ? (
        <div className="space-y-6">
          <div className="flex p-1 bg-secondary/10 rounded-2xl max-w-xs mx-auto backdrop-blur-sm border border-white/10">
            <Button 
              variant="ghost" 
              className={cn(
                "flex-1 rounded-xl h-10 gap-2 transition-all font-bold text-xs uppercase tracking-tighter", 
                scanMode === 'photo' ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
              )}
              onClick={() => setScanMode('photo')}
            >
              <Camera className="h-4 w-4" /> Foto
            </Button>
            <Button 
              variant="ghost" 
              className={cn(
                "flex-1 rounded-xl h-10 gap-2 transition-all font-bold text-xs uppercase tracking-tighter", 
                scanMode === 'video' ? "bg-white text-secondary shadow-sm" : "text-muted-foreground"
              )}
              onClick={() => setScanMode('video')}
            >
              <Video className="h-4 w-4" /> Video
            </Button>
          </div>

          <div className="relative aspect-video rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl bg-black group">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover" 
              autoPlay 
              muted 
              playsInline 
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {isRecording && (
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-red-500/90 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg animate-pulse">
                <div className="h-2 w-2 bg-white rounded-full animate-ping" />
                REC 00:{recordingTime.toString().padStart(2, '0')}
              </div>
            )}

            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                <Alert variant="destructive" className="border-none bg-red-500/20 text-white">
                  <AlertCircle className="h-5 w-5 text-white" />
                  <AlertTitle className="font-black uppercase tracking-tighter">Cámara Bloqueada</AlertTitle>
                  <AlertDescription className="text-xs opacity-90">Por favor, activa los permisos de cámara en tu navegador para usar la visión IA.</AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          {scanMode === 'photo' ? (
            <Button 
              className="w-full h-20 rounded-[2rem] bg-primary text-white font-black text-xl shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all" 
              onClick={capturePhoto} 
              disabled={hasCameraPermission === false || loading}
            >
              <Camera className="h-8 w-8 mr-3" /> ANALIZAR AHORA
            </Button>
          ) : (
            <Button 
              className={cn(
                "w-full h-20 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all", 
                isRecording ? "bg-red-500 text-white" : "bg-secondary text-white"
              )} 
              onClick={isRecording ? stopRecording : startRecording} 
              disabled={hasCameraPermission === false || loading}
            >
              {isRecording ? <><StopCircle className="h-8 w-8 mr-3" /> DETENER</> : <><Radio className="h-8 w-8 mr-3 animate-pulse" /> GRABAR VIDEO</>}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in zoom-in duration-300">
          <Card className="overflow-hidden border-none shadow-2xl glass relative">
            <div className="absolute top-4 right-4 z-20">
               <Button size="icon" variant="destructive" className="rounded-full h-10 w-10 shadow-xl" onClick={resetScanner}>
                 <X className="h-5 w-5" />
               </Button>
            </div>
            <div className="relative h-72 w-full bg-black/20 flex items-center justify-center">
              {preview.includes('video') ? (
                <video src={preview} controls className="w-full h-full object-contain" />
              ) : (
                <img src={preview} alt="Captured" className="w-full h-full object-contain" />
              )}
              {loading && (
                <div className="absolute inset-0 bg-primary/40 backdrop-blur-md flex flex-col items-center justify-center text-white space-y-4">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin" />
                    <Sparkles className="absolute -top-2 -right-2 h-6 w-6 animate-pulse" />
                  </div>
                  <p className="font-black uppercase tracking-widest text-xs">{t('scan.identifying')}</p>
                </div>
              )}
            </div>
          </Card>

          {results && (
            <Card className="glass border-accent/20 animate-in slide-in-from-bottom duration-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ChefHat className="text-accent h-6 w-6" /> {t('scan.completed')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground italic mb-2">"{results.summary}"</p>
                {results.identifiedIngredients.map((ing, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/10 shadow-inner group">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">{ing.name}</span>
                      <span className="text-[10px] uppercase font-black text-muted-foreground">{ing.quantity || '1 unidad'}</span>
                    </div>
                    <Badge className={cn(
                      "rounded-lg border-none",
                      ing.confidence > 0.8 ? "bg-green-500/20 text-green-500" : "bg-orange-500/20 text-orange-500"
                    )}>
                      {Math.round(ing.confidence * 100)}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg" onClick={addAllToPantry}>
                  <CheckCircle2 className="mr-2 h-5 w-5" /> {t('scan.saveBtn')}
                </Button>
                <Link href="/recipes" className="w-full">
                  <Button variant="outline" className="w-full h-12 rounded-2xl border-2 border-accent text-accent font-bold">
                    {t('scan.suggestBtn')}
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full font-bold text-muted-foreground uppercase tracking-widest text-[10px]" onClick={resetScanner}>
                  <RefreshCw className="mr-2 h-3 w-3" /> {t('scan.retry')}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
