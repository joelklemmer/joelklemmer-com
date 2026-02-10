'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type ContrastMode = 'default' | 'high';

interface ContrastContextValue {
  contrast: ContrastMode;
  setContrast: (contrast: ContrastMode) => void;
}

const ContrastContext = createContext<ContrastContextValue | undefined>(
  undefined,
);

const CONTRAST_COOKIE = 'joelklemmer-contrast';
const CONTRAST_COOKIE_MAX_AGE_DAYS = 365;

function getContrastFromCookie(): ContrastMode | null {
  if (typeof document === 'undefined' || !document.cookie) return null;
  const m = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CONTRAST_COOKIE}=([^;]*)`),
  );
  const v = m?.[1]?.trim();
  return v === 'high' ? 'high' : v === 'default' ? 'default' : null;
}

function setContrastCookie(contrast: ContrastMode): void {
  try {
    document.cookie = `${CONTRAST_COOKIE}=${contrast}; path=/; max-age=${
      CONTRAST_COOKIE_MAX_AGE_DAYS * 86400
    }; SameSite=Lax`;
  } catch {
    // Ignore
  }
}

function getStoredContrast(): ContrastMode {
  if (typeof window === 'undefined') return 'default';
  const fromCookie = getContrastFromCookie();
  if (fromCookie) return fromCookie;
  const fromRoot = document.documentElement.getAttribute('data-contrast');
  return fromRoot === 'high' ? 'high' : 'default';
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

function getSystemContrast(): ContrastMode {
  if (typeof window === 'undefined') return 'default';
  // Check prefers-contrast media query
  if (window.matchMedia('(prefers-contrast: more)').matches) {
    return 'high';
  }
  return 'default';
}

export function ContrastProvider({ children }: { children: ReactNode }) {
  const [contrast, setContrastState] = useState<ContrastMode>('default');
  const [mounted, setMounted] = useState(false);

  // SSR-safe hydration
  useEffect(() => {
    setMounted(true);
    const stored = getStoredContrast();
    // If no stored preference, respect system preference
    const initial =
      stored === 'default' && typeof window !== 'undefined'
        ? getSystemContrast()
        : stored;
    setContrastState(initial);
    applyContrast(initial);
  }, []);

  // Listen for system contrast changes when contrast is 'default'
  useEffect(() => {
    if (!mounted || contrast !== 'default') return;

    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    const handleChange = () => {
      const systemContrast = getSystemContrast();
      if (systemContrast !== contrast) {
        setContrastState(systemContrast);
        applyContrast(systemContrast);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [contrast, mounted]);

  useEffect(() => {
    applyContrast(contrast);
    setContrastCookie(contrast);
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
