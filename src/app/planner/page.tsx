
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
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";

export default function PlannerPage() {
  const { schedule, saveSchedule } = usePantry();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [localSchedule, setLocalSchedule] = useState<DaySchedule[]>([]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (schedule.length > 0) {
      setLocalSchedule(schedule);
    }
  }, [schedule]);

  if (isUserLoading || !user) return null;

  const toggleDay = (day: string) => {
    setLocalSchedule(prev => prev.map(s => s.day === day ? { ...s, isCooking: !s.isCooking } : s));
  };

  const updateTime = (day: string, time: string) => {
    setLocalSchedule(prev => prev.map(s => s.day === day ? { ...s, reminderTime: time } : s));
  };

  const handleSave = () => {
    saveSchedule(localSchedule);
    toast({ title: t('planner.saved') });
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
            <div key={s.day} className={cn("p-4 rounded-2xl flex items-center justify-between", s.isCooking ? "bg-primary/5 border border-primary" : "opacity-60")}>
              <Label className="font-bold">{t(`planner.${s.day}`)}</Label>
              <div className="flex items-center gap-3">
                {s.isCooking && <Input type="time" value={s.reminderTime} onChange={(e) => updateTime(s.day, e.target.value)} className="w-24 h-8" />}
                <Switch checked={s.isCooking} onCheckedChange={() => toggleDay(s.day)} />
              </div>
            </div>
          ))}
          <Button className="w-full h-14 mt-4" onClick={handleSave}><CheckCircle2 className="mr-2" /> {t('planner.save')}</Button>
        </CardContent>
      </Card>

      <div className="mx-2 p-6 glass rounded-[2rem] flex items-start gap-4">
        <AlertCircle className="text-accent" />
        <div>
          <h3 className="font-bold text-sm text-accent">{t('planner.notifTitle')}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t('planner.notifDesc')}</p>
        </div>
      </div>
    </div>
  );
}
