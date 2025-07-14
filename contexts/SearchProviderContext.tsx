'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type SearchProvider = 'brave' | 'exa';

interface SearchProviderContextType {
  searchProvider: SearchProvider;
  setSearchProvider: (provider: SearchProvider) => void;
}

const SearchProviderContext = createContext<SearchProviderContextType | undefined>(undefined);

interface SearchProviderProviderProps {
  children: React.ReactNode;
}

export function SearchProviderProvider({ children }: SearchProviderProviderProps) {
  const [searchProvider, setSearchProviderState] = useState<SearchProvider>('brave');

  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchProvider') as SearchProvider;
    if (saved && ['brave', 'exa'].includes(saved)) {
      setSearchProviderState(saved);
    }
  }, []);

  // Save to localStorage when changed
  const setSearchProvider = (provider: SearchProvider) => {
    setSearchProviderState(provider);
    localStorage.setItem('searchProvider', provider);
  };

  return (
    <SearchProviderContext.Provider value={{ searchProvider, setSearchProvider }}>
      {children}
    </SearchProviderContext.Provider>
  );
}

export function useSearchProvider() {
  const context = useContext(SearchProviderContext);
  if (context === undefined) {
    throw new Error('useSearchProvider must be used within a SearchProviderProvider');
  }
  return context;
}