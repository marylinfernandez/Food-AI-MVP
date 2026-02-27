"use client";

import { useState, useEffect, useRef } from "react";
import { aiVoiceInventoryUpdate, VoiceInventoryUpdateOutput } from "@/ai/flows/ai-voice-inventory-update-flow";
import { usePantry } from "@/lib/pantry-store";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, CheckCircle2, ArrowRight, Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function TalkPage() {
  const { toast } = useToast();
  const { items, updateItem, addItem, removeItem } = usePantry();
  const [isListening, setIsListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [command, setCommand] = useState("");
  const [updates, setUpdates] = useState<VoiceInventoryUpdateOutput | null>(null);

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;
    setProcessing(true);
    setUpdates(null);
    try {
      const result = await aiVoiceInventoryUpdate(text);
      setUpdates(result);
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
          <Mic className="h-6 w-6" /> Asistente de Voz
        </h1>
        <p className="text-sm text-muted-foreground px-8">"Acabo de gastar toda la leche" o "Añade 3 manzanas".</p>
      </div>

      <div className="relative group">
        <div className={cn(
          "absolute -inset-4 bg-primary/20 rounded-full blur-xl transition-all duration-1000",
          isListening ? "scale-150 opacity-100 animate-pulse" : "scale-100 opacity-0"
        )} />
        <Button 
          onClick={() => setIsListening(!isListening)}
          size="lg" 
          className={cn(
            "relative h-32 w-32 rounded-full shadow-2xl transition-all duration-500",
            isListening ? "bg-accent scale-110" : "bg-primary"
          )}
        >
          {isListening ? <MicOff className="h-12 w-12" /> : <Mic className="h-12 w-12" />}
        </Button>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Escribe o habla tu cambio..."
          className="w-full bg-white border border-border rounded-2xl px-6 py-4 text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary h-16"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit(command);
          }}
        />
        <Button 
          className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary/20 h-10"
          onClick={() => handleSubmit(command)}
          disabled={processing || !command}
        >
          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Procesar Comando"}
        </Button>
      </div>

      {updates && (
        <Card className="w-full max-w-sm animate-in zoom-in duration-300 border-accent bg-accent/5">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              ¿Confirmas estos cambios?
            </h3>
            <div className="space-y-3">
              {updates.map((u, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                  <div>
                    <span className="text-xs uppercase font-bold text-muted-foreground">{u.action}</span>
                    <p className="font-bold">{u.itemName}</p>
                  </div>
                  <Badge variant="secondary">{u.quantity || 'all'}</Badge>
                </div>
              ))}
            </div>
            <Button className="w-full bg-primary rounded-xl h-12" onClick={applyUpdates}>
              Aplicar a mi Despensa
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 w-full">
         <Card className="p-3 bg-secondary/30 border-none">
           <p className="text-[10px] uppercase font-bold opacity-50 mb-1 text-primary">Prueba diciendo</p>
           <p className="text-xs italic">"He gastado media mantequilla"</p>
         </Card>
         <Card className="p-3 bg-secondary/30 border-none">
           <p className="text-[10px] uppercase font-bold opacity-50 mb-1 text-primary">Prueba diciendo</p>
           <p className="text-xs italic">"Añade una docena de huevos"</p>
         </Card>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
