
"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Un componente de toggle para cambiar entre modo claro y oscuro.
 * Sincronizado en tamaño (h-8 w-8) con los otros iconos del Header.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkStored = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(isDarkStored);
    if (isDarkStored) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      className="rounded-full h-8 w-8 hover:bg-white/30 transition-all duration-300 active:scale-90"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-accent animate-in spin-in-180 duration-500" />
      ) : (
        <Moon className="h-4 w-4 text-primary animate-in spin-in-180 duration-500" />
      )}
    </Button>
  );
}
