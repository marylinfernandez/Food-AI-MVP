
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";

/**
 * @fileOverview Redirección de la raíz a la sección de Despensa tras la eliminación de Inicio.
 */
export default function RootPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push("/login");
      } else {
        router.push("/pantry");
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-pulse text-primary font-bold uppercase tracking-widest text-xs">
        Cargando Nexus...
      </div>
    </div>
  );
}
