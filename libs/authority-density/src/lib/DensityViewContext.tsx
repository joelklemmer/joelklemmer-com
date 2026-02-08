'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isDensityHashPresent, setDensityHash } from './densityState';

interface DensityViewContextValue {
  isDensityOn: boolean;
  setDensityOn: (on: boolean) => void;
  toggleDensity: () => void;
}

const DensityViewContext = createContext<DensityViewContextValue | null>(null);

export interface DensityViewProviderProps {
  children: ReactNode;
  /** When true, sync state from URL hash on mount and on hashchange. */
  syncWithHash?: boolean;
}

/**
 * Provides density view state. Optional sync with #density hash.
 * Keyboard-accessible toggle is separate (DensityViewToggle).
 */
export function DensityViewProvider({
  children,
  syncWithHash = true,
}: DensityViewProviderProps) {
  const [isDensityOn, setDensityOnState] = useState(false);

  const setDensityOn = useCallback((on: boolean) => {
    setDensityOnState(on);
    setDensityHash(on);
  }, []);

  const toggleDensity = useCallback(() => {
    setDensityOnState((prev) => {
      const next = !prev;
      setDensityHash(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!syncWithHash || typeof window === 'undefined') return;
    const read = () => setDensityOnState(isDensityHashPresent());
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, [syncWithHash]);

  const value = useMemo<DensityViewContextValue>(
    () => ({ isDensityOn, setDensityOn, toggleDensity }),
    [isDensityOn, setDensityOn, toggleDensity],
  );

  return (
    <DensityViewContext.Provider value={value}>
      {children}
    </DensityViewContext.Provider>
  );
}

export function useDensityView(): DensityViewContextValue {
  const ctx = useContext(DensityViewContext);
  if (!ctx) {
    return {
      isDensityOn: false,
      setDensityOn: () => {},
      toggleDensity: () => {},
    };
  }
  return ctx;
}
