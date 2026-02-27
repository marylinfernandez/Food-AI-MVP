"use client";

import { usePantry, PantryItem } from "@/lib/pantry-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Edit2, Plus, Search, Calendar, Package, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function PantryPage() {
  const { items, removeItem, updateItem, addItem } = usePantry();
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
        <Button size="icon" className="rounded-full shadow-lg" onClick={() => addItem({ name: "Nuevo Item", quantity: "1 unidad" })}>
          <Plus className="h-6 w-6" />
        </Button>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar en mi inventario..." 
          className="pl-10 rounded-2xl bg-white border-none shadow-sm h-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground space-y-4">
            <Package className="h-12 w-12 mx-auto opacity-20" />
            <p>No hay ingredientes aquí... aún.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{item.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" /> {item.quantity}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {format(item.lastUpdated, "d MMM")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <section className="pt-4">
        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-4 flex items-center gap-4">
          <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/70">IA Insights</p>
            <p className="text-sm font-medium">Parece que te estás quedando sin Huevos. ¿Quieres añadirlos a la lista?</p>
          </div>
          <Button size="sm" className="rounded-full h-8 px-4 text-xs">Añadir</Button>
        </div>
      </section>
    </div>
  );
}
