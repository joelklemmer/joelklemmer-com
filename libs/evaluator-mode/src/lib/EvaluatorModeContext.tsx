'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  type EvaluatorMode,
  resolveEvaluatorMode,
  DEFAULT_EVALUATOR_MODE,
} from './evaluatorMode';

const EVALUATOR_COOKIE = 'evaluator_mode';
const EVALUATOR_COOKIE_MAX_AGE_DAYS = 365;

function setEvaluatorCookie(mode: EvaluatorMode): void {
  try {
    if (typeof document === 'undefined') return;
    document.cookie = `${EVALUATOR_COOKIE}=${mode}; path=/; max-age=${
      EVALUATOR_COOKIE_MAX_AGE_DAYS * 86400
    }; SameSite=Lax`;
    document.documentElement.setAttribute('data-evaluator', mode);
  } catch {
    // Ignore
  }
}

interface EvaluatorModeContextValue {
  mode: EvaluatorMode;
  setMode: (mode: EvaluatorMode) => void;
}

const EvaluatorModeContext = createContext<EvaluatorModeContextValue | null>(
  null,
);

export interface EvaluatorModeProviderProps {
  children: ReactNode;
  /** Initial mode from server (headers/cookies). */
  initialMode?: EvaluatorMode;
}

/**
 * Provides evaluator mode to the tree. Use initialMode from server for SSR/CSR alignment.
 * setMode updates cookie and data-evaluator on document for persistence and SSR on next load.
 */
export function EvaluatorModeProvider({
  children,
  initialMode = DEFAULT_EVALUATOR_MODE,
}: EvaluatorModeProviderProps) {
  const [mode, setModeState] = useState<EvaluatorMode>(initialMode);

  const setMode = useCallback((next: EvaluatorMode) => {
    setModeState(next);
    setEvaluatorCookie(next);
  }, []);

  const value = useMemo<EvaluatorModeContextValue>(
    () => ({ mode, setMode }),
    [mode, setMode],
  );

  return (
    <EvaluatorModeContext.Provider value={value}>
      {children}
    </EvaluatorModeContext.Provider>
  );
}

/**
 * Resolve current evaluator mode from client (window). Use for client-side sync with URL/cookie.
 * Returns same shape as server resolveEvaluatorMode for consistency.
 */
export function resolveEvaluatorModeClient(): EvaluatorMode {
  if (typeof window === 'undefined') return DEFAULT_EVALUATOR_MODE;
  const params = new URLSearchParams(window.location.search);
  const searchParams: Record<string, string> = {};
  params.forEach((v, k) => {
    searchParams[k] = v;
  });
  const isDev = process.env.NODE_ENV !== 'production';
  return resolveEvaluatorMode({
    cookies: document.cookie,
    searchParams,
    isDev,
  });
}

export function useEvaluatorMode(): EvaluatorMode {
  const ctx = useContext(EvaluatorModeContext);
  if (ctx) return ctx.mode;
  return DEFAULT_EVALUATOR_MODE;
}

export function useEvaluatorModeContext(): EvaluatorModeContextValue | null {
  return useContext(EvaluatorModeContext);
}
