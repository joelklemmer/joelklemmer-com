'use client';

/**
 * Hook for synced accessibility preferences.
 * Subscribes to jk:a11y-prefs-changed and storage events for bidirectional UI sync.
 * Use in header menu and preferences page so both stay visually in sync.
 */
import { useEffect, useState, useCallback } from 'react';
import {
  readAccessibilityPrefs,
  setAccessibilityPref,
  resetAccessibilityPrefs,
  EVENT_A11Y_PREFS_CHANGED,
  type AccessibilityPrefs,
} from './behavior-runtime';

const STORAGE_A11Y_PREFS = 'joelklemmer-a11y-prefs';

export function useAccessibilityPrefs(): {
  prefs: AccessibilityPrefs;
  setPref: (partial: Partial<AccessibilityPrefs>) => void;
  reset: () => void;
} {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(() =>
    readAccessibilityPrefs(),
  );

  const refresh = useCallback(() => {
    setPrefs(readAccessibilityPrefs());
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_A11Y_PREFS) refresh();
    };
    const handleChanged = () => refresh();

    window.addEventListener('storage', handleStorage);
    window.addEventListener(EVENT_A11Y_PREFS_CHANGED, handleChanged);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(EVENT_A11Y_PREFS_CHANGED, handleChanged);
    };
  }, [refresh]);

  const setPref = useCallback((partial: Partial<AccessibilityPrefs>) => {
    const next = setAccessibilityPref(partial);
    setPrefs(next);
  }, []);

  const reset = useCallback(() => {
    resetAccessibilityPrefs();
    setPrefs(readAccessibilityPrefs());
  }, []);

  return { prefs, setPref, reset };
}
