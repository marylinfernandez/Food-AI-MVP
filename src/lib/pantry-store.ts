
"use client";

import { useEffect, useState } from "react";

export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  lastUpdated: Date;
}

const STORAGE_KEY = "pantry_items_v1";

const DEFAULT_ITEMS: PantryItem[] = [
  { id: "1", name: "Milk", quantity: "1L", lastUpdated: new Date() },
  { id: "2", name: "Eggs", quantity: "6 units", lastUpdated: new Date() },
  { id: "3", name: "Butter", quantity: "Half a bar", lastUpdated: new Date() },
];

export function usePantry() {
  const [items, setItems] = useState<PantryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setItems(parsed.map((i: any) => ({ ...i, lastUpdated: new Date(i.lastUpdated) })));
      } catch (e) {
        setItems(DEFAULT_ITEMS);
      }
    } else {
      setItems(DEFAULT_ITEMS);
    }
  }, []);

  const saveItems = (newItems: PantryItem[]) => {
    setItems(newItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  };

  const addItem = (item: Omit<PantryItem, "id" | "lastUpdated">) => {
    const newItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date(),
    };
    saveItems([newItem, ...items]);
  };

  const updateItem = (id: string, updates: Partial<PantryItem>) => {
    saveItems(items.map(i => i.id === id ? { ...i, ...updates, lastUpdated: new Date() } : i));
  };

  const removeItem = (id: string) => {
    saveItems(items.filter(i => i.id !== id));
  };

  return { items, addItem, updateItem, removeItem };
}
