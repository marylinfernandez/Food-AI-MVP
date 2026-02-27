
"use client";

import { usePantry, DaySchedule } from "@/lib/pantry-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Bell, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function PlannerPage() {
  const { schedule, saveSchedule } = usePantry();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [localSchedule, setLocalSchedule] = useState<DaySchedule[]>([]);

  useEffect(() => {
    if (schedule.length > 0) {
      setLocalSchedule(schedule);
    }
  }, [schedule]);

  const toggleDay = (day: string) => {
    setLocalSchedule(prev => prev.map(s => 
      s.day === day ? { ...s, isCooking: !s.isCooking } : s
    ));
  };

  const updateTime = (day: string, time: string) => {
    setLocalSchedule(prev => prev.map(s => 
      s.day === day ? { ...s, reminderTime: time } : s
    ));
  };

  const handleSave = () => {
    saveSchedule(localSchedule);
    toast({
      title: t('planner.saved'),
      description: "Tus recordatorios han sido configurados.",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <header className="px-2 space-y-1">
        <h1 className="text-3xl font-bold text-primary tracking-tight">{t('planner.title')}</h1>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-70">
          {t('planner.subtitle')}
        </p>
      </header>

      <Card className="glass border-none shadow-xl mx-2">
        <CardHeader>
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
               <Bell className="h-5 w-5 text-primary" />
             </div>
             <div>
               <CardTitle className="text-xl">Recordatorios</CardTitle>
               <CardDescription className="text-xs">
                 {t('planner.desc')}
               </CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {localSchedule.map((s) => (
              <div 
                key={s.day} 
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all flex flex-col gap-3",
                  s.isCooking 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "border-transparent bg-secondary/5 opacity-70"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                      s.isCooking ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {t(`planner.${s.day}`).charAt(0)}
                    </div>
                    <Label className="font-bold text-sm cursor-pointer" onClick={() => toggleDay(s.day)}>
                      {t(`planner.${s.day}`)}
                    </Label>
                  </div>
                  <Switch 
                    checked={s.isCooking} 
                    onCheckedChange={() => toggleDay(s.day)}
                  />
                </div>

                {s.isCooking && (
                  <div className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">{t('planner.reminderTime')}:</span>
                    <Input 
                      type="time" 
                      className="h-9 w-28 rounded-xl glass border-white/20 text-xs"
                      value={s.reminderTime}
                      onChange={(e) => updateTime(s.day, e.target.value)}
                    />
                  </div>
                )}
                
                {!s.isCooking && (
                   <p className="text-[10px] italic text-muted-foreground ml-11">
                     {t('planner.notCooking')}
                   </p>
                )}
              </div>
            ))}
          </div>

          <Button 
            className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg bg-primary mt-4" 
            onClick={handleSave}
          >
            <CheckCircle2 className="h-5 w-5 mr-2" /> {t('planner.save')}
          </Button>
        </CardContent>
      </Card>
      
      <div className="px-4 py-2">
         <div className="bg-accent/10 rounded-[2rem] p-6 border border-accent/20 flex items-start gap-4 glass">
            <CalendarDays className="h-6 w-6 text-accent mt-1" />
            <div>
              <h3 className="font-bold text-sm text-accent uppercase tracking-wider">Planificación Inteligente</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                FoodAI te enviará notificaciones en los días seleccionados para que tu despensa esté siempre actualizada antes de cocinar.
              </p>
            </div>
         </div>
      </div>
    </div>
  );
}
