'use client';

/**
 * Accessibility Control Panel (ACP) Provider
 *
 * Governed subsystem for managing accessibility preferences with:
 * - Persistence across reloads
 * - Consistent application to document root
 * - SSR-safe hydration
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  type ACPPreferences,
  type MotionPreference,
  type TextSizePreference,
  type UnderlineLinksPreference,
  getStoredPreferences,
  applyMotionPreference,
  applyTextSizePreference,
  applyUnderlineLinksPreference,
  storeMotionPreference,
  storeTextSizePreference,
  storeUnderlineLinksPreference,
  initializeACPPreferences,
} from './acp';

interface ACPContextValue {
  preferences: ACPPreferences;
  setMotion: (motion: MotionPreference) => void;
  setTextSize: (textSize: TextSizePreference) => void;
  setUnderlineLinks: (underlineLinks: UnderlineLinksPreference) => void;
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
    const stored = initializeACPPreferences();
    setPreferencesState(stored);
  }, []);

  // Apply motion preference
  useEffect(() => {
    if (!mounted) return;
    applyMotionPreference(preferences.motion);
    storeMotionPreference(preferences.motion);
  }, [preferences.motion, mounted]);

  // Apply text size preference
  useEffect(() => {
    if (!mounted) return;
    applyTextSizePreference(preferences.textSize);
    storeTextSizePreference(preferences.textSize);
  }, [preferences.textSize, mounted]);

  // Apply underline links preference
  useEffect(() => {
    if (!mounted) return;
    applyUnderlineLinksPreference(preferences.underlineLinks);
    storeUnderlineLinksPreference(preferences.underlineLinks);
  }, [preferences.underlineLinks, mounted]);

  const setMotion = (motion: MotionPreference) => {
    setPreferencesState((prev) => ({ ...prev, motion }));
  };

  const setTextSize = (textSize: TextSizePreference) => {
    setPreferencesState((prev) => ({ ...prev, textSize }));
  };

  const setUnderlineLinks = (underlineLinks: UnderlineLinksPreference) => {
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
