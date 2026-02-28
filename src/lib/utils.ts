import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normaliza un texto para comparaciones inteligentes:
 * - Elimina espacios al inicio/final.
 * - Convierte a minúsculas.
 * - Elimina tildes (acentos).
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
