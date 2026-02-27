
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TourContextProps {
  guideStep: number;
  setGuideStep: (step: number) => void;
  nextStep: () => void;
}

const TourContext = createContext<TourContextProps | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const [guideStep, setGuideStep] = useState(0);

  const nextStep = () => {
    if (guideStep >= 5) {
      setGuideStep(0);
    } else {
      setGuideStep(prev => prev + 1);
    }
  };

  return (
    <TourContext.Provider value={{ guideStep, setGuideStep, nextStep }}>
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
