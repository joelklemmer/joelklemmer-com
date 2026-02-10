'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_COOKIE = 'joelklemmer-theme';
const THEME_COOKIE_MAX_AGE_DAYS = 365;

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getThemeFromCookie(): Theme | null {
  if (typeof document === 'undefined' || !document.cookie) return null;
  const m = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${THEME_COOKIE}=([^;]*)`),
  );
  const v = m?.[1]?.trim();
  return v === 'light' || v === 'dark' || v === 'system' ? (v as Theme) : null;
}

function setThemeCookie(theme: Theme): void {
  try {
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${
      THEME_COOKIE_MAX_AGE_DAYS * 86400
    }; SameSite=Lax`;
  } catch {
    // Ignore
  }
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const fromCookie = getThemeFromCookie();
  if (fromCookie) return fromCookie;
  const fromRoot = document.documentElement.getAttribute('data-theme');
  if (fromRoot === 'light' || fromRoot === 'dark') return fromRoot;
  return 'system';
}

/** Always sets data-theme to "light" or "dark". System mode uses resolved OS preference. */
function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  root.setAttribute('data-theme', resolved);
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
    setThemeCookie(theme);
  }, [theme, mounted]);

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    if (!mounted || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyTheme('system');
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
