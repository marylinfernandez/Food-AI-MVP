
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface TourContextProps {
  guideStep: number;
  setGuideStep: (step: number) => void;
  nextStep: () => void;
}

const TourContext = createContext<TourContextProps | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const [guideStep, setGuideStep] = useState(0);
  const router = useRouter();

  const nextStep = () => {
    const next = guideStep >= 5 ? 0 : guideStep + 1;
    setGuideStep(next);

    // Navegación automática según el paso del tour
    switch (next) {
      case 1:
        router.push('/scan');
        break;
      case 2:
        router.push('/pantry');
        break;
      case 3:
        router.push('/recipes');
        break;
      case 4:
        router.push('/recipes'); // Sección de tiendas dentro de recetas
        break;
      case 5:
        router.push('/pantry'); // Calendario/Historial en pantry
        break;
      default:
        router.push('/');
        break;
    }
  };

  const handleSetGuideStep = (step: number) => {
    setGuideStep(step);
    if (step === 0) router.push('/');
    if (step === 1) router.push('/scan');
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
