"use client";

import { useState, useEffect, useRef } from "react";
import { aiGuidedProfileCreation, UserProfile } from "@/ai/flows/ai-guided-profile-creation";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff, User, Volume2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isCalling, setIsCalling] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({});
  const [conversationHistory, setConversationHistory] = useState<{ speaker: 'user' | 'ai', text: string }[]>([]);
  const [latestUserInput, setLatestUserInput] = useState("");
  const [aiResponseText, setAiResponseText] = useState("Hola, soy FoodAI. Hagamos tu perfil familiar rápidamente por voz.");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startCall = () => {
    setIsCalling(true);
    handleConversationStep("");
  };

  const endCall = () => {
    setIsCalling(false);
    setIsListening(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleConversationStep = async (input: string) => {
    setIsListening(false);
    try {
      const result = await aiGuidedProfileCreation({
        currentProfile: profile,
        latestUserInput: input,
        conversationHistory: conversationHistory,
      });

      setAiResponseText(result.aiResponseText);
      setProfile(result.updatedProfile);
      setConversationHistory(prev => [
        ...prev,
        { speaker: 'user', text: input },
        { speaker: 'ai', text: result.aiResponseText }
      ]);

      if (result.aiResponseAudio) {
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = result.aiResponseAudio;
        audioRef.current.play();
        audioRef.current.onended = () => {
          if (!result.isConversationComplete) {
            setIsListening(true);
          }
        };
      }

      if (result.isConversationComplete) {
        toast({
          title: "¡Perfil Completado!",
          description: "Ya estamos listos para cocinar con FoodAI.",
        });
        setTimeout(() => router.push("/"), 3000);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Hubo un problema con la llamada. Intenta de nuevo.",
        variant: "destructive"
      });
      setIsCalling(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">Configuración de Perfil</h1>
        <p className="text-muted-foreground text-sm px-8">Hablemos un momento para entender qué te gusta y qué necesitas.</p>
      </div>

      {!isCalling ? (
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <Button 
            onClick={startCall}
            size="lg" 
            className="relative h-32 w-32 rounded-full flex flex-col gap-2 bg-primary hover:bg-primary/90 shadow-2xl transition-transform hover:scale-105"
          >
            <Phone className="h-10 w-10" />
            <span className="text-xs font-bold">Llamar a IA</span>
          </Button>
        </div>
      ) : (
        <Card className="w-full max-w-sm overflow-hidden bg-primary text-white border-none shadow-2xl ring-4 ring-primary/20">
          <CardContent className="p-8 flex flex-col items-center space-y-8">
            <div className="relative">
              <div className={cn(
                "absolute inset-0 rounded-full bg-accent/20 animate-ping",
                isListening ? "duration-500" : "duration-1000"
              )} />
              <div className="relative h-24 w-24 rounded-full bg-white flex items-center justify-center text-primary">
                {isListening ? <Mic className="h-10 w-10" /> : <Volume2 className="h-10 w-10" />}
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest opacity-80 font-bold">
                {isListening ? "Escuchando..." : "Llamada en curso"}
              </p>
              <h2 className="text-lg font-medium leading-tight h-20 flex items-center justify-center italic">
                "{aiResponseText}"
              </h2>
            </div>

            {isListening && (
              <div className="w-full space-y-4">
                <input
                  type="text"
                  placeholder="Di algo..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConversationStep((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                <p className="text-[10px] text-center opacity-60">Presiona Enter para enviar si no quieres usar micrófono</p>
              </div>
            )}

            <Button 
              variant="destructive" 
              onClick={endCall}
              className="rounded-full h-14 w-14 p-0 bg-red-500 hover:bg-red-600 shadow-lg"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </CardContent>
        </Card>
      )}

      {Object.keys(profile).length > 0 && (
        <Card className="w-full bg-secondary/50 border-none">
          <CardContent className="p-4 flex flex-wrap gap-2">
            {profile.numberOfPeople && <Badge variant="outline">Personas: {profile.numberOfPeople}</Badge>}
            {profile.allergies?.map(a => <Badge key={a} className="bg-red-100 text-red-700">{a}</Badge>)}
            {profile.dietaryPreferences?.map(p => <Badge key={p} className="bg-green-100 text-green-700">{p}</Badge>)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
