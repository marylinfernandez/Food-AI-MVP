
"use client";

import { useTour } from "@/context/tour-context";
import { useTranslation } from "@/context/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X, ChevronRight } from "lucide-react";

export function TourOverlay() {
  const { guideStep, setGuideStep, nextStep } = useTour();
  const { t } = useTranslation();

  if (guideStep === 0) return null;

  return (
    <div className="fixed top-24 left-0 right-0 z-[100] px-4 animate-in slide-in-from-top duration-500 max-w-lg mx-auto pointer-events-none">
      <Card className="glass border-primary/40 bg-primary/10 overflow-hidden relative shadow-2xl border-2 pointer-events-auto">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-primary/20" 
          onClick={() => setGuideStep(0)}
        >
          <X className="h-3 w-3" />
        </Button>
        <CardHeader className="pb-2 bg-primary/20">
          <CardTitle className="text-lg flex items-center gap-2 text-primary font-black uppercase tracking-tight">
            <Sparkles className="h-5 w-5 animate-pulse" /> {t(`guide.step${guideStep}.title`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4 pt-4">
          <p className="leading-relaxed font-medium italic text-foreground/90">"{t(`guide.step${guideStep}.desc`)}"</p>
          <div className="flex justify-between items-center pt-2">
             <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">{guideStep} / 5</span>
             <Button size="sm" className="rounded-xl px-6 bg-primary font-bold shadow-lg hover:scale-105 transition-transform" onClick={nextStep}>
               {guideStep === 5 ? t('guide.finish') : t('guide.next')} <ChevronRight className="h-3 w-3 ml-1" />
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
