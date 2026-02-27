
"use client";

import { usePantry } from "@/lib/pantry-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Edit2, Plus, Search, Calendar, Package, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function PantryPage() {
  const { items, removeItem, addItem } = usePantry();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Mi Despensa</h1>
          <p className="text-muted-foreground text-sm">Organización inteligente sin esfuerzo.</p>
        </div>
        <Button size="icon" className="rounded-full shadow-lg bg-primary hover:bg-primary/90 h-12 w-12" onClick={() => addItem({ name: "Nuevo Item", quantity: "1 unidad" })}>
          <Plus className="h-6 w-6" />
        </Button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Buscar en mi inventario..." 
          className="pl-12 rounded-2xl bg-white/70 backdrop-blur-sm border-none shadow-inner h-14 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground space-y-4 glass rounded-[2rem]">
            <Package className="h-16 w-16 mx-auto opacity-10" />
            <p className="font-medium">No hay ingredientes aquí... aún.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-lg glass group hover:scale-[1.01] transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">{item.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5 bg-secondary/10 px-2 py-1 rounded-full">
                      <Package className="h-3.5 w-3.5" /> {item.quantity}
                    </span>
                    <span className="flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-full">
                      <Calendar className="h-3.5 w-3.5" /> {format(item.lastUpdated, "d MMM")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <section className="pt-6">
        <div className="glass border-primary/20 rounded-[2rem] p-6 flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full -mr-16 -mt-16"></div>
          <div className="h-14 w-14 bg-white/80 rounded-2xl shadow-xl flex items-center justify-center relative z-10">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">IA Insights</p>
            <p className="text-sm font-semibold leading-snug">Parece que te estás quedando sin Huevos. ¿Quieres añadirlos a la lista?</p>
          </div>
          <Button size="sm" className="rounded-xl h-10 px-6 bg-primary text-white font-bold relative z-10 shadow-lg">Añadir</Button>
        </div>
      </section>
    </div>
  );
}
