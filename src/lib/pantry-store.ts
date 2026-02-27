
"use client";

import { useEffect, useState } from "react";

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

const STORAGE_ITEMS_KEY = "foodai_pantry_items_v2";
const STORAGE_RECIPES_KEY = "foodai_recipes_history_v2";

export function usePantry() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [historyRecipes, setHistoryRecipes] = useState<HistoryRecipe[]>([]);

  useEffect(() => {
    const storedItems = localStorage.getItem(STORAGE_ITEMS_KEY);
    const storedRecipes = localStorage.getItem(STORAGE_RECIPES_KEY);
    
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    }
    if (storedRecipes) {
      setHistoryRecipes(JSON.parse(storedRecipes));
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

  const addItem = (item: Omit<PantryItem, "id" | "scannedAt">) => {
    const newItem: PantryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      scannedAt: new Date().toISOString(),
    };
    saveItems([newItem, ...items]);
  };

  const addRecipeToHistory = (recipe: { name: string, prepTime: number }) => {
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

  return { items, historyRecipes, addItem, addRecipeToHistory, removeItem };
}
