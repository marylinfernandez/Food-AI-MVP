
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
    if (!isUserLoading) {
      if (user) {
        router.replace("/pantry");
      } else {
        router.replace("/login");
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <div className="animate-pulse text-primary font-bold uppercase tracking-widest text-[10px]">
        Sincronizando con FoodAI...
      </div>
    </div>
  );
}
