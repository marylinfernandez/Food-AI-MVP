
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { Loader2, Sparkles } from "lucide-react";

/**
 * @fileOverview Controlador de tráfico inteligente.
 * Redirige al usuario según su estado de sesión real, evitando bucles de redirección.
 */
export default function RootPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // Solo redirigir cuando Firebase haya terminado de cargar el estado inicial de autenticación
    if (!isUserLoading) {
      if (user) {
        // Usuario logueado -> Despensa
        router.replace("/pantry");
      } else {
        // Usuario no logueado -> Login
        router.replace("/login");
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6">
      <div className="relative">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-accent animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="animate-pulse text-primary font-black uppercase tracking-[0.3em] text-[10px]">
          FoodAI
        </p>
        <p className="text-muted-foreground text-[8px] uppercase tracking-widest mt-2">
          Conectando con tu cocina inteligente...
        </p>
      </div>
    </div>
  );
}
