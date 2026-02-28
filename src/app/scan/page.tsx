
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Loader2, Refrigerator, ChefHat, Video, StopCircle, Radio, RefreshCw, X } from "lucide-react";
import { aiIngredientIdentification, IngredientIdentificationOutput } from "@/ai/flows/ai-ingredient-identification";
import { usePantry } from "@/lib/pantry-store";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { useTranslation } from "@/context/language-context";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";

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

    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: { ideal: "environment" } },
          audio: false
        });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
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
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [preview, results, isUserLoading, user]);

  if (isUserLoading || !user) return null;

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

  const startRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      chunksRef.current = [];
      const stream = videoRef.current.srcObject as MediaStream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const dataUri = reader.result as string;
          setPreview(dataUri);
          identify(dataUri);
        };
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      setTimeout(() => {
        if (mediaRecorder.state === 'recording') stopRecording();
      }, 10000);
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
        description: `Análisis de ${scanMode} de nevera/despensa`
      });
      setResults(output);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de Escaneo",
        description: "No se pudo identificar el contenido.",
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
      description: `Se han añadido ${results.identifiedIngredients.length} ingredientes.`,
    });
    resetScanner();
  };

  const resetScanner = () => {
    setResults(null);
    setPreview(null);
    setIsRecording(false);
    setRecordingTime(0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
          <Camera className="h-8 w-8 text-accent" /> {t('scan.title')}
        </h1>
        <p className="text-sm text-muted-foreground uppercase tracking-widest opacity-70">{t('scan.subtitle')}</p>
      </div>

      {!preview ? (
        <div className="space-y-6">
          <div className="flex p-1 bg-secondary/10 rounded-2xl max-w-xs mx-auto">
            <Button 
              variant="ghost" 
              className={cn("flex-1 rounded-xl h-10 gap-2", scanMode === 'photo' ? "bg-white text-primary" : "text-muted-foreground")}
              onClick={() => setScanMode('photo')}
            >
              <Camera className="h-4 w-4" /> Foto
            </Button>
            <Button 
              variant="ghost" 
              className={cn("flex-1 rounded-xl h-10 gap-2", scanMode === 'video' ? "bg-white text-secondary" : "text-muted-foreground")}
              onClick={() => setScanMode('video')}
            >
              <Video className="h-4 w-4" /> Video
            </Button>
          </div>

          <div className="relative aspect-video rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl bg-black">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            {isRecording && (
              <div className="absolute top-4 left-4 bg-red-500/80 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                REC 00:{recordingTime.toString().padStart(2, '0')}
              </div>
            )}
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/80">
                <Alert variant="destructive">
                  <AlertTitle>Cámara Bloqueada</AlertTitle>
                  <AlertDescription>Por favor activa los permisos de cámara.</AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          {scanMode === 'photo' ? (
            <Button className="w-full h-20 rounded-[2rem] bg-primary text-white font-bold text-xl" onClick={capturePhoto} disabled={hasCameraPermission === false}>
              <Camera className="h-8 w-8 mr-3" /> ANALIZAR AHORA
            </Button>
          ) : (
            <Button className={cn("w-full h-20 rounded-[2rem] font-bold text-xl", isRecording ? "bg-red-500" : "bg-secondary")} onClick={isRecording ? stopRecording : startRecording} disabled={hasCameraPermission === false}>
              {isRecording ? "DETENER" : "GRABAR"}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="overflow-hidden border-none shadow-2xl glass">
            <div className="relative h-72 w-full bg-black">
              {preview.startsWith('data:video') ? <video src={preview} controls className="w-full h-full" /> : <Image src={preview} alt="Captured" fill className="object-contain" />}
              {loading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white"><Loader2 className="h-12 w-12 animate-spin" /></div>}
            </div>
          </Card>
          {results && (
            <Card className="glass border-accent/20">
              <CardHeader><CardTitle>{t('scan.completed')}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {results.identifiedIngredients.map((ing, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/10 p-4 rounded-xl">
                    <span>{ing.name} ({ing.quantity})</span>
                    <Badge>{Math.round(ing.confidence * 100)}%</Badge>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" onClick={addAllToPantry}>{t('scan.saveBtn')}</Button>
                <Button variant="ghost" onClick={resetScanner}>{t('scan.retry')}</Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
