'use client';

/**
 * Runs applyDocumentAttrs on mount to ensure theme and other prefs are correctly
 * applied to the document. Fixes React hydration overwriting data-theme when
 * server sends "system" and the theme script has resolved it to light/dark.
 * Renders nothing.
 */
import { useEffect } from 'react';
import { applyDocumentAttrs } from '@joelklemmer/behavior-runtime';

export function ThemeSync() {
  useEffect(() => {
    applyDocumentAttrs();
  }, []);
  return null;
}
