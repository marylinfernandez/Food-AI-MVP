
"use client";

import { usePantry } from "@/lib/pantry-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Search, Calendar, Package, Sparkles, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/language-context";

export default function PantryPage() {
  const { items, removeItem, addItem } = usePantry();
  const { t, language } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("");

  const filteredItems = items.filter(i => 
    t(i.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddManual = () => {
    if (newItemName.trim()) {
      addItem({ 
        name: newItemName, 
        quantity: newItemQty || "1 unidad" 
      });
      setNewItemName("");
      setNewItemQty("");
      setIsAddingManual(false);
    }
  };

  const formatDate = (date: Date) => {
    const locale = language === 'english' ? 'en-US' : (language === 'spanish-es' ? 'es-ES' : 'es-MX');
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex justify-between items-end px-2">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">{t('pantry.title')}</h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-70">{t('pantry.subtitle')}</p>
        </div>
        <Button 
          size="icon" 
          className={cn(
            "rounded-full shadow-lg h-12 w-12 transition-all duration-300",
            isAddingManual ? "bg-destructive rotate-45" : "bg-primary hover:scale-110"
          )} 
          onClick={() => setIsAddingManual(!isAddingManual)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </header>

      {isAddingManual && (
        <Card className="glass border-primary/20 bg-primary/5 animate-in slide-in-from-top duration-300 overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">{t('pantry.add')}</h3>
            <div className="grid grid-cols-1 gap-3">
              <Input 
                placeholder={t('pantry.namePlaceholder')}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="rounded-xl border-white/10 bg-white/5 h-12"
              />
              <Input 
                placeholder={t('pantry.qtyPlaceholder')}
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                className="rounded-xl border-white/10 bg-white/5 h-12"
              />
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 rounded-xl h-12 font-bold" onClick={handleAddManual}>
                  <Check className="h-4 w-4 mr-2" /> {t('pantry.save')}
                </Button>
                <Button variant="ghost" className="rounded-xl h-12" onClick={() => setIsAddingManual(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative group px-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder={t('pantry.search')} 
          className="pl-12 rounded-[1.5rem] bg-white/40 dark:bg-black/20 backdrop-blur-md border-white/10 shadow-xl h-14 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4 px-1">
        {filteredItems.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground space-y-4 glass rounded-[2rem] border-white/5">
            <Package className="h-16 w-16 mx-auto opacity-10" />
            <p className="font-medium uppercase tracking-[0.2em] text-xs">{t('pantry.empty')}</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-xl glass group hover:scale-[1.01] transition-all duration-300">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                    {t(item.name)}
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 bg-secondary/10 px-2.5 py-1 rounded-full text-secondary">
                      <Package className="h-3 w-3" /> {t(item.quantity)}
                    </span>
                    <span className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full text-primary">
                      <Calendar className="h-3 w-3" /> {formatDate(item.lastUpdated)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <section className="pt-6 px-1">
        <div className="glass border-primary/20 rounded-[2rem] p-6 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700"></div>
          <div className="h-14 w-14 bg-white/80 dark:bg-white/10 rounded-2xl shadow-xl flex items-center justify-center relative z-10">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">IA Insights</p>
            <p className="text-sm font-semibold leading-snug">
              {language === 'english' 
                ? `Your inventory has grown ${Math.round(items.length * 5)}% this week.` 
                : `Tu inventario ha crecido un ${Math.round(items.length * 5)}% esta semana.`
              }
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
