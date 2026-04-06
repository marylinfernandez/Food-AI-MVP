"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { Loader2 } from "lucide-react";

/**
 * @fileOverview Controlador de tráfico inteligente.
 * Redirige al usuario según su estado de sesión real, evitando bucles de redirección.
 */
export default function RootPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // Solo redirigir cuando Firebase haya terminado de cargar el estado inicial
    if (!isUserLoading) {
      if (user) {
        router.replace("/pantry");
      } else {
        router.replace("/login");
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
        </div>
      </div>
      <div className="animate-pulse text-primary font-bold uppercase tracking-widest text-[10px]">
        Sincronizando con FoodAI...
      </div>
    </div>
  );
}
