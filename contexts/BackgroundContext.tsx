'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface BackgroundContextType {
  showGridBackground: boolean;
  setShowGridBackground: (show: boolean) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [showGridBackground, setShowGridBackground] = useState(false);

  return (
    <BackgroundContext.Provider value={{ showGridBackground, setShowGridBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}