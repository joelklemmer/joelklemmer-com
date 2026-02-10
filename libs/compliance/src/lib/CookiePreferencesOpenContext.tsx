'use client';

import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
const CookiePreferencesModalLazy = lazy(() =>
  import('./CookiePreferencesModal').then((m) => ({
    default: m.CookiePreferencesModal,
  })),
);

export interface CookiePreferencesOpenContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const CookiePreferencesOpenContext =
  createContext<CookiePreferencesOpenContextValue | null>(null);

export function useCookiePreferencesOpen(): CookiePreferencesOpenContextValue {
  const ctx = useContext(CookiePreferencesOpenContext);
  if (!ctx) {
    throw new Error(
      'useCookiePreferencesOpen must be used within CookiePreferencesOpenProvider',
    );
  }
  return ctx;
}

export function CookiePreferencesOpenProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <CookiePreferencesOpenContext.Provider value={{ open, close, isOpen }}>
      {children}
      {isOpen && (
        <Suspense fallback={null}>
          <CookiePreferencesModalLazy isOpen={isOpen} onClose={close} />
        </Suspense>
      )}
    </CookiePreferencesOpenContext.Provider>
  );
}
