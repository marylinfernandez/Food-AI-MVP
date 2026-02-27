
"use client";

import { useUser } from "@/firebase";
import { ThemeToggle } from "./theme-toggle";
import { Settings, Sparkles, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Encabezado global persistente con estética futurista.
 */
export function Header() {
  const { user } = useUser();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) return null;

  return (
    <header className="flex justify-between items-center mb-6 px-2 animate-in fade-in slide-in-from-top duration-500">
      <div className="flex flex-col">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.4)] neo-glow group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col -space-y-1">
            <h1 className="text-xl font-bold text-primary tracking-tighter">
              PantryPal <span className="text-secondary">AI</span>
            </h1>
            {user && (
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                Nexus: {user.displayName || "Chef"}
              </span>
            )}
          </div>
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/settings">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "rounded-full transition-all duration-300",
              pathname === "/settings" 
                ? "bg-primary text-white shadow-lg" 
                : "bg-secondary/10 hover:bg-secondary/20 text-secondary"
            )}
          >
            <Languages className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
