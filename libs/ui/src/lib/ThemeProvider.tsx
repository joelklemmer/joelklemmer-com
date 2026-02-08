'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'joelklemmer-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored === 'light' || stored === 'dark' || stored === 'system'
      ? stored
      : 'system') as Theme;
  } catch {
    return 'system';
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // SSR-safe hydration: prevent flash of wrong theme
  useEffect(() => {
    setMounted(true);
    const stored = getStoredTheme();
    setThemeState(stored);
    const resolved = stored === 'system' ? getSystemTheme() : stored;
    setResolvedTheme(resolved);
    applyTheme(stored);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setResolvedTheme(theme === 'system' ? getSystemTheme() : theme);
    applyTheme(theme);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [theme, mounted]);

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    if (!mounted || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
