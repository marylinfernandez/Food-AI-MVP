
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Refrigerator, Camera, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/language-context";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { label: t('nav.home'), href: "/", icon: LayoutDashboard },
    { label: t('nav.pantry'), href: "/pantry", icon: Refrigerator },
    { label: t('nav.scan'), href: "/scan", icon: Camera },
    { label: t('nav.recipes'), href: "/recipes", icon: ChefHat },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t pb-safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6 mb-1", isActive && "animate-pulse-soft")} />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
