'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type ContrastMode = 'default' | 'high';

interface ContrastContextValue {
  contrast: ContrastMode;
  setContrast: (contrast: ContrastMode) => void;
}

const ContrastContext = createContext<ContrastContextValue | undefined>(undefined);

const CONTRAST_STORAGE_KEY = 'joelklemmer-contrast';

function getStoredContrast(): ContrastMode {
  if (typeof window === 'undefined') return 'default';
  const stored = localStorage.getItem(CONTRAST_STORAGE_KEY);
  return stored === 'high' ? 'high' : 'default';
}

function applyContrast(contrast: ContrastMode) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (contrast === 'high') {
    root.setAttribute('data-contrast', 'high');
  } else {
    root.removeAttribute('data-contrast');
  }
}

export function ContrastProvider({ children }: { children: ReactNode }) {
  const [contrast, setContrastState] = useState<ContrastMode>('default');

  useEffect(() => {
    const stored = getStoredContrast();
    setContrastState(stored);
    applyContrast(stored);
  }, []);

  useEffect(() => {
    applyContrast(contrast);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONTRAST_STORAGE_KEY, contrast);
    }
  }, [contrast]);

  const setContrast = (newContrast: ContrastMode) => {
    setContrastState(newContrast);
  };

  return (
    <ContrastContext.Provider value={{ contrast, setContrast }}>
      {children}
    </ContrastContext.Provider>
  );
}

export function useContrast() {
  const context = useContext(ContrastContext);
  if (context === undefined) {
    throw new Error('useContrast must be used within ContrastProvider');
  }
  return context;
}
