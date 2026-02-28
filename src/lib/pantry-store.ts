"use client";

import { useEffect, useState } from "react";
import { normalizeText } from "./utils";

export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  scannedAt: string; // ISO String para comparación de fechas
}

export interface HistoryRecipe {
  id: string;
  name: string;
  prepTime: number;
  scannedAt: string; // ISO String
}

export interface DaySchedule {
  day: string;
  isCooking: boolean;
  reminderTime: string; // "HH:mm" format
}

const STORAGE_ITEMS_KEY = "foodai_pantry_items_v2";
const STORAGE_RECIPES_KEY = "foodai_recipes_history_v2";
const STORAGE_PLANNER_KEY = "foodai_planner_schedule_v2";

export function usePantry() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [historyRecipes, setHistoryRecipes] = useState<HistoryRecipe[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);

  useEffect(() => {
    const storedItems = localStorage.getItem(STORAGE_ITEMS_KEY);
    const storedRecipes = localStorage.getItem(STORAGE_RECIPES_KEY);
    const storedSchedule = localStorage.getItem(STORAGE_PLANNER_KEY);
    
    if (storedItems) setItems(JSON.parse(storedItems));
    if (storedRecipes) setHistoryRecipes(JSON.parse(storedRecipes));
    
    if (storedSchedule) {
      setSchedule(JSON.parse(storedSchedule));
    } else {
      // Default empty schedule
      const defaultSchedule = [
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
      ].map(day => ({ day, isCooking: false, reminderTime: "09:00" }));
      setSchedule(defaultSchedule);
    }
  }, []);

  const saveItems = (newItems: PantryItem[]) => {
    setItems(newItems);
    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(newItems));
  };

  const saveRecipes = (newRecipes: HistoryRecipe[]) => {
    setHistoryRecipes(newRecipes);
    localStorage.setItem(STORAGE_RECIPES_KEY, JSON.stringify(newRecipes));
  };

  const saveSchedule = (newSchedule: DaySchedule[]) => {
    setSchedule(newSchedule);
    localStorage.setItem(STORAGE_PLANNER_KEY, JSON.stringify(newSchedule));
  };

  const addItem = (item: Omit<PantryItem, "id" | "scannedAt">) => {
    const newItem: PantryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      scannedAt: new Date().toISOString(),
    };
    saveItems([newItem, ...items]);
  };

  const addRecipeToHistory = (recipe: { name: string, prepTime: number }) => {
    const today = new Date().toDateString();
    const normalizedNewName = normalizeText(recipe.name);
    
    // Evitar duplicados para el mismo día (independiente de mayúsculas, tildes o espacios)
    // La IA entiende que son lo mismo gracias a la normalización estricta.
    const alreadyExists = historyRecipes.some(r => 
      normalizeText(r.name) === normalizedNewName && 
      new Date(r.scannedAt).toDateString() === today
    );

    if (alreadyExists) return;

    const newRecipe: HistoryRecipe = {
      id: Math.random().toString(36).substr(2, 9),
      name: recipe.name,
      prepTime: recipe.prepTime,
      scannedAt: new Date().toISOString(),
    };
    saveRecipes([newRecipe, ...historyRecipes]);
  };

  const removeItem = (id: string) => {
    saveItems(items.filter(i => i.id !== id));
  };

  return { 
    items, 
    historyRecipes, 
    schedule, 
    addItem, 
    addRecipeToHistory, 
    removeItem, 
    saveSchedule 
  };
}
