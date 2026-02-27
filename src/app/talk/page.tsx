
"use client";

import { useState, useEffect } from "react";
import { aiVoiceInventoryUpdate, VoiceInventoryUpdateOutput } from "@/ai/flows/ai-voice-inventory-update-flow";
import { usePantry } from "@/lib/pantry-store";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/language-context";

export default function TalkPage() {
  const { toast } = useToast();
  const { items, updateItem, addItem, removeItem } = usePantry();
  const { t, language } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [command, setCommand] = useState("");
  const [updates, setUpdates] = useState<VoiceInventoryUpdateOutput | null>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({ 
        title: "No soportado", 
        description: "Tu navegador no soporta reconocimiento de voz. Por favor usa Chrome.", 
        variant: "destructive" 
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'english' ? 'en-US' : 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setUpdates(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error:', event.error);
      setIsListening(false);
      toast({ 
        title: "Error de Micrófono", 
        description: "No se pudo acceder a tu voz. Revisa los permisos.", 
        variant: "destructive" 
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCommand(transcript);
      handleSubmit(transcript);
    };

    recognition.start();
  };

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;
    setProcessing(true);
    setUpdates(null);
    try {
      const result = await aiVoiceInventoryUpdate(text);
      setUpdates(result);
      if (result.length === 0) {
        toast({
          title: "Sin cambios detectados",
          description: "La IA no detectó actualizaciones claras en tu mensaje.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No pudimos entender el comando. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const applyUpdates = () => {
    if (!updates) return;
    updates.forEach(upd => {
      if (upd.action === 'add') {
        addItem({ name: upd.itemName, quantity: upd.quantity || "1 unidad" });
      } else if (upd.action === 'remove') {
        const item = items.find(i => i.name.toLowerCase().includes(upd.itemName.toLowerCase()));
        if (item) removeItem(item.id);
      } else if (upd.action === 'update') {
        const item = items.find(i => i.name.toLowerCase().includes(upd.itemName.toLowerCase()));
        if (item) updateItem(item.id, { quantity: upd.quantity });
      }
    });
    toast({
      title: "Actualización Exitosa",
      description: "Inventario actualizado correctamente.",
    });
    setUpdates(null);
    setCommand("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
          <Mic className="h-6 w-6" /> {t('talk.title')}
        </h1>
        <p className="text-sm text-muted-foreground px-8">{t('talk.desc')}</p>
      </div>

      <div className="relative group">
        <div className={cn(
          "absolute -inset-8 bg-primary/20 rounded-full blur-2xl transition-all duration-1000",
          isListening ? "scale-150 opacity-100 animate-pulse" : "scale-100 opacity-0"
        )} />
        <Button 
          onClick={isListening ? () => {} : startListening}
          size="lg" 
          disabled={processing}
          className={cn(
            "relative h-32 w-32 rounded-full shadow-2xl transition-all duration-500",
            isListening ? "bg-accent scale-110" : "bg-primary hover:scale-105"
          )}
        >
          {isListening ? (
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1 mb-1">
                <span className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-white rounded-full animate-bounce"></span>
              </div>
              <span className="text-[10px] font-bold">ESCUCHANDO</span>
            </div>
          ) : processing ? (
            <Loader2 className="h-12 w-12 animate-spin" />
          ) : (
            <Mic className="h-12 w-12" />
          )}
        </Button>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div className="relative">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Dime qué cambió en tu cocina..."
            className="w-full bg-white border border-border rounded-2xl px-6 py-4 text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary h-16 pr-14"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit(command);
            }}
          />
          {command && (
            <Button 
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl text-primary"
              onClick={() => handleSubmit(command)}
            >
              <CheckCircle2 className="h-6 w-6" />
            </Button>
          )}
        </div>
        {!isListening && !processing && (
          <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold opacity-60">
            Toca el círculo para hablar o escribe arriba
          </p>
        )}
      </div>

      {updates && updates.length > 0 && (
        <Card className="w-full max-w-sm animate-in zoom-in duration-300 border-accent bg-accent/5">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              {t('talk.confirm')}
            </h3>
            <div className="space-y-3">
              {updates.map((u, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-black/5">
                  <div>
                    <Badge variant="outline" className={cn(
                      "text-[9px] uppercase font-black mb-1 px-1.5 h-4 border-none",
                      u.action === 'add' ? "bg-green-100 text-green-700" : 
                      u.action === 'remove' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {u.action}
                    </Badge>
                    <p className="font-bold text-sm">{u.itemName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-muted-foreground block">{u.quantity || 'total'}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full bg-primary rounded-xl h-12 shadow-lg" onClick={applyUpdates}>
              {t('talk.apply')}
            </Button>
          </CardContent>
        </Card>
      )}

      {updates && updates.length === 0 && !processing && (
        <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-tight bg-destructive/10 px-4 py-2 rounded-full">
          <AlertCircle className="h-4 w-4" /> No se detectaron ingredientes
        </div>
      )}
    </div>
  );
}
