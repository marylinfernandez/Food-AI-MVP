"use client";

import { usePantry, DaySchedule } from "@/lib/pantry-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";

/**
 * @fileOverview Página de planificación semanal.
 * Corregido: Se eliminan bucles infinitos de actualización de estado mediante refs y sincronización controlada.
 */
export default function PlannerPage() {
  const { schedule, saveSchedule } = usePantry();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  const [localSchedule, setLocalSchedule] = useState<DaySchedule[]>([]);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  // Sincronizar solo una vez cuando los datos del servidor estén listos
  useEffect(() => {
    if (schedule && schedule.length > 0 && !hasInitialized.current) {
      setLocalSchedule(schedule);
      hasInitialized.current = true;
    }
  }, [schedule]);

  if (isUserLoading || !user) return null;

  const toggleDay = (day: string, checked: boolean) => {
    setLocalSchedule(prev => prev.map(s => 
      s.day === day ? { ...s, isCooking: checked } : s
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
      description: t('planner.savedDesc')
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <header className="px-2">
        <h1 className="text-3xl font-bold text-primary">{t('planner.title')}</h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest">{t('planner.subtitle')}</p>
      </header>

      <Card className="glass border-none shadow-xl mx-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="text-primary" />
            <CardTitle>{t('planner.notifications')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {localSchedule.map((s) => (
            <div 
              key={s.day} 
              className={cn(
                "p-4 rounded-2xl flex items-center justify-between transition-all duration-300", 
                s.isCooking ? "bg-primary/5 border border-primary/20" : "opacity-60 bg-secondary/5"
              )}
            >
              <Label className="font-bold cursor-pointer" htmlFor={`switch-${s.day}`}>
                {t(`planner.${s.day}`)}
              </Label>
              <div className="flex items-center gap-3">
                {s.isCooking && (
                  <Input 
                    type="time" 
                    value={s.reminderTime} 
                    onChange={(e) => updateTime(s.day, e.target.value)} 
                    className="w-24 h-8 rounded-lg text-xs" 
                  />
                )}
                <Switch 
                  id={`switch-${s.day}`}
                  checked={s.isCooking} 
                  onCheckedChange={(checked) => toggleDay(s.day, checked)} 
                />
              </div>
            </div>
          ))}
          <Button 
            className="w-full h-14 mt-4 rounded-2xl font-bold shadow-lg bg-primary hover:scale-[1.01] active:scale-[0.99] transition-all" 
            onClick={handleSave}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" /> {t('planner.save')}
          </Button>
        </CardContent>
      </Card>

      <div className="mx-2 p-6 glass rounded-[2rem] flex items-start gap-4 border-accent/20">
        <AlertCircle className="text-accent h-6 w-6 shrink-0" />
        <div>
          <h3 className="font-bold text-sm text-accent uppercase tracking-wider">{t('planner.notifTitle')}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t('planner.notifDesc')}</p>
        </div>
      </div>
    </div>
  );
}
