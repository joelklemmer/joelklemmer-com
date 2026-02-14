'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  type ContrastMode,
  getStoredContrast,
  setContrast as setContrastStorage,
  getSystemContrast,
} from '@joelklemmer/behavior-runtime';

interface ContrastContextValue {
  contrast: ContrastMode;
  setContrast: (contrast: ContrastMode) => void;
}

const ContrastContext = createContext<ContrastContextValue | undefined>(
  undefined,
);

export function ContrastProvider({ children }: { children: ReactNode }) {
  const [contrast, setContrastState] = useState<ContrastMode>('default');
  const [mounted, setMounted] = useState(false);

  // SSR-safe hydration
  useEffect(() => {
    setMounted(true);
    const stored = getStoredContrast();
    const initial =
      stored === 'default' && typeof window !== 'undefined'
        ? getSystemContrast()
        : stored;
    setContrastState(initial);
    setContrastStorage(initial);
  }, []);

  // Listen for system contrast changes when contrast is 'default'
  useEffect(() => {
    if (!mounted || contrast !== 'default') return;

    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    const handleChange = () => {
      const systemContrast = getSystemContrast();
      if (systemContrast !== contrast) {
        setContrastState(systemContrast);
        setContrastStorage(systemContrast);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [contrast, mounted]);

  useEffect(() => {
    setContrastStorage(contrast);
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
