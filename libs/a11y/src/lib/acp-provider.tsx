'use client';

/**
 * Accessibility Control Panel (ACP) Provider
 *
 * Governed subsystem for managing accessibility preferences with:
 * - Persistence across reloads
 * - Consistent application to document root
 * - SSR-safe hydration
 * Delegates to BehaviorRuntime for storage and apply.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  type MotionPreference,
  type TextSizePreference,
  getStoredMotion,
  getStoredTextSize,
  getStoredUnderlineLinks,
  setMotion as setMotionStorage,
  setTextSize as setTextSizeStorage,
  setUnderlineLinks as setUnderlineLinksStorage,
  applyDocumentAttrs,
} from '@joelklemmer/behavior-runtime';

interface ACPPreferences {
  motion: MotionPreference;
  textSize: TextSizePreference;
  underlineLinks: boolean;
}

interface ACPContextValue {
  preferences: ACPPreferences;
  setMotion: (motion: MotionPreference) => void;
  setTextSize: (textSize: TextSizePreference) => void;
  setUnderlineLinks: (underlineLinks: boolean) => void;
}

const ACPContext = createContext<ACPContextValue | undefined>(undefined);

export function ACPProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<ACPPreferences>({
    motion: 'default',
    textSize: 'default',
    underlineLinks: false,
  });
  const [mounted, setMounted] = useState(false);

  // SSR-safe hydration: initialize from localStorage and apply to document
  useEffect(() => {
    setMounted(true);
    const stored: ACPPreferences = {
      motion: getStoredMotion(),
      textSize: getStoredTextSize(),
      underlineLinks: getStoredUnderlineLinks(),
    };
    setPreferencesState(stored);
    applyDocumentAttrs(stored);
  }, []);

  // Apply and persist when preferences change
  useEffect(() => {
    if (!mounted) return;
    setMotionStorage(preferences.motion);
    setTextSizeStorage(preferences.textSize);
    setUnderlineLinksStorage(preferences.underlineLinks);
  }, [
    preferences.motion,
    preferences.textSize,
    preferences.underlineLinks,
    mounted,
  ]);

  const setMotion = (motion: MotionPreference) => {
    setPreferencesState((prev) => ({ ...prev, motion }));
  };

  const setTextSize = (textSize: TextSizePreference) => {
    setPreferencesState((prev) => ({ ...prev, textSize }));
  };

  const setUnderlineLinks = (underlineLinks: boolean) => {
    setPreferencesState((prev) => ({ ...prev, underlineLinks }));
  };

  return (
    <ACPContext.Provider
      value={{
        preferences,
        setMotion,
        setTextSize,
        setUnderlineLinks,
      }}
    >
      {children}
    </ACPContext.Provider>
  );
}

export function useACP() {
  const context = useContext(ACPContext);
  if (context === undefined) {
    throw new Error('useACP must be used within ACPProvider');
  }
  return context;
}
