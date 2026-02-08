'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type ContrastMode = 'default' | 'high';

interface ContrastContextValue {
  contrast: ContrastMode;
  setContrast: (contrast: ContrastMode) => void;
}

const ContrastContext = createContext<ContrastContextValue | undefined>(undefined);

const CONTRAST_STORAGE_KEY = 'joelklemmer-contrast';

function getSystemContrast(): ContrastMode {
  if (typeof window === 'undefined') return 'default';
  return window.matchMedia('(prefers-contrast: more)').matches ? 'high' : 'default';
}

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
  const [contrast, setContrastState] = useState<ContrastMode>(() => {
    // Initialize synchronously on client
    if (typeof window !== 'undefined') {
      const stored = getStoredContrast();
      const systemContrast = getSystemContrast();
      return stored !== 'default' ? stored : systemContrast;
    }
    return 'default';
  });

  useEffect(() => {
    // Check if user has stored preference, otherwise respect system preference
    const stored = getStoredContrast();
    const systemContrast = getSystemContrast();
    const initialContrast = stored !== 'default' ? stored : systemContrast;
    setContrastState(initialContrast);
    applyContrast(initialContrast);
  }, []);

  // Listen for system contrast changes when contrast is default
  useEffect(() => {
    if (contrast !== 'default' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    const handleChange = () => {
      const systemContrast = getSystemContrast();
      setContrastState(systemContrast);
      applyContrast(systemContrast);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [contrast, mounted]);

  useEffect(() => {
    applyContrast(contrast);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONTRAST_STORAGE_KEY, contrast);
    }
  }, [contrast]);

  const setContrast = (newContrast: ContrastMode) => {
    setContrastState(newContrast);
  };

  // Prevent flash of wrong contrast on SSR - render immediately but apply contrast synchronously
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
