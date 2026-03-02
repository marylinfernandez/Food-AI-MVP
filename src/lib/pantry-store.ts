
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking, useDoc } from "@/firebase";
import { collection, query, where, orderBy, doc, DocumentReference, CollectionReference } from "firebase/firestore";
import { normalizeText } from "./utils";
import { useMemo } from "react";

export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  scannedAt: string;
  userId: string;
}

export interface HistoryRecipe {
  id: string;
  name: string;
  prepTime: number;
  scannedAt: string;
  userId: string;
}

export interface DaySchedule {
  day: string;
  isCooking: boolean;
  reminderTime: string;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DEFAULT_SCHEDULE: DaySchedule[] = DAYS.map(day => ({ 
  day, 
  isCooking: false, 
  reminderTime: "09:00" 
}));

const EMPTY_ARRAY: any[] = [];

export function usePantry() {
  const { user } = useUser();
  const db = useFirestore();

  // --- Pantry Items ---
  const pantryItemsRef = useMemoFirebase(() => 
    user ? query(collection(db, `users/${user.uid}/pantryItems`), orderBy("scannedAt", "desc")) : null
  , [user, db]);
  
  const { data: items, isLoading: itemsLoading } = useCollection<PantryItem>(pantryItemsRef);

  // --- Recipe History ---
  const recipesRef = useMemoFirebase(() => 
    user ? query(collection(db, `users/${user.uid}/recipeInteractions`), orderBy("scannedAt", "desc")) : null
  , [user, db]);
  
  const { data: historyRecipes, isLoading: recipesLoading } = useCollection<HistoryRecipe>(recipesRef);

  // --- Planner Schedule ---
  const scheduleDocRef = useMemoFirebase(() => 
    user ? doc(db, `users/${user.uid}/recipeInteractions/planner_settings`) : null
  , [user, db]);

  const { data: scheduleData, isLoading: scheduleLoading } = useDoc<any>(scheduleDocRef);

  // Memoizar el horario para evitar bucles de renderizado
  const currentSchedule = useMemo(() => {
    if (!scheduleData?.days) return DEFAULT_SCHEDULE;
    return scheduleData.days;
  }, [scheduleData]);

  const addItem = (item: Omit<PantryItem, "id" | "scannedAt" | "userId">) => {
    if (!user) return;
    const colRef = collection(db, `users/${user.uid}/pantryItems`);
    addDocumentNonBlocking(colRef, {
      ...item,
      userId: user.uid,
      scannedAt: new Date().toISOString(),
    });
  };

  const addRecipeToHistory = (recipe: { name: string, prepTime: number }) => {
    if (!user) return;
    const today = new Date().toDateString();
    const normalizedNewName = normalizeText(recipe.name);
    
    // Evitar duplicados basados en nombre normalizado y fecha
    const recipesForToday = (historyRecipes || []).filter(r => new Date(r.scannedAt).toDateString() === today);
    const alreadyExists = recipesForToday.some(r => normalizeText(r.name) === normalizedNewName);

    if (alreadyExists) return;

    const colRef = collection(db, `users/${user.uid}/recipeInteractions`);
    addDocumentNonBlocking(colRef, {
      name: recipe.name,
      prepTime: recipe.prepTime,
      userId: user.uid,
      scannedAt: new Date().toISOString(),
    });
  };

  const removeItem = (id: string) => {
    if (!user) return;
    const docRef = doc(db, `users/${user.uid}/pantryItems`, id);
    deleteDocumentNonBlocking(docRef);
  };

  const updateItem = (id: string, data: Partial<PantryItem>) => {
    if (!user) return;
    const docRef = doc(db, `users/${user.uid}/pantryItems`, id);
    updateDocumentNonBlocking(docRef, data);
  };

  const saveSchedule = (newSchedule: DaySchedule[]) => {
    if (!user || !scheduleDocRef) return;
    setDocumentNonBlocking(scheduleDocRef, { days: newSchedule, userId: user.uid }, { merge: true });
  };

  return { 
    items: items || EMPTY_ARRAY, 
    historyRecipes: historyRecipes || EMPTY_ARRAY, 
    schedule: currentSchedule, 
    isLoading: itemsLoading || recipesLoading || scheduleLoading,
    addItem, 
    addRecipeToHistory, 
    removeItem, 
    updateItem,
    saveSchedule 
  };
}
