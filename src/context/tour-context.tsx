'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface TourContextProps {
  guideStep: number;
  setGuideStep: (step: number) => void;
  nextStep: () => void;
}

const TourContext = createContext<TourContextProps | undefined>(undefined);

/**
 * @fileOverview Contexto global para manejar el Tour Interactivo y la autonavegación.
 * Actualizado para incluir 6 pasos.
 */
export function TourProvider({ children }: { children: ReactNode }) {
  const [guideStep, setGuideStep] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const nextStep = () => {
    const next = guideStep >= 6 ? 0 : guideStep + 1;
    handleSetGuideStep(next);
  };

  const handleSetGuideStep = (step: number) => {
    setGuideStep(step);
    
    // Navegación automática según el paso del tour
    if (step === 0) {
      if (pathname !== '/') router.push('/');
      return;
    }

    switch (step) {
      case 1:
        router.push('/scan');
        break;
      case 2:
        router.push('/pantry');
        break;
      case 3:
      case 4:
        router.push('/recipes');
        break;
      case 5:
        router.push('/pantry');
        break;
      case 6:
        router.push('/planner');
        break;
      default:
        router.push('/');
        break;
    }
  };

  return (
    <TourContext.Provider value={{ guideStep, setGuideStep: handleSetGuideStep, nextStep }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour debe ser usado dentro de un TourProvider');
  }
  return context;
}
