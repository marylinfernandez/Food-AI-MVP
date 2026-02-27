"use client";

import { useUser } from "@/firebase";
import { ThemeToggle } from "./theme-toggle";
import { Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * @fileOverview Encabezado global persistente que contiene el logo, bienvenida y toggle de tema.
 */
export function Header() {
  const { user } = useUser();
  const pathname = usePathname();
  
  // No mostrar el encabezado completo en la página de login si se prefiere una vista limpia
  const isLoginPage = pathname === "/login";

  return (
    <header className="flex justify-between items-center mb-6 px-2">
      <div className="flex flex-col">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg neo-glow group-hover:scale-110 transition-transform">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-primary tracking-tight">
            PantryPal <span className="text-secondary">AI</span>
          </h1>
        </Link>
        {user && pathname === "/" && !isLoginPage && (
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-1 opacity-70">
            Bienvenido, {user.displayName || user.email?.split('@')[0] || "Chef"}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user && !isLoginPage && (
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 hover:bg-primary/20">
              <Settings className="h-5 w-5 text-primary" />
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
