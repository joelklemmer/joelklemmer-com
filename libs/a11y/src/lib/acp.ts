/**
 * Accessibility Control Panel (ACP) - Core utilities and types
 *
 * Governed subsystem for managing accessibility preferences:
 * - Motion reduction
 * - Text sizing
 * - Underline links
 *
 * All preferences persist to localStorage and are applied consistently.
 */

export type MotionPreference = 'default' | 'reduced';
export type TextSizePreference = 'default' | 'large';
export type UnderlineLinksPreference = boolean;

export interface ACPPreferences {
  motion: MotionPreference;
  textSize: TextSizePreference;
  underlineLinks: UnderlineLinksPreference;
}

export const ACP_STORAGE_KEYS = {
  motion: 'joelklemmer-motion',
  textSize: 'joelklemmer-text-size',
  underlineLinks: 'joelklemmer-underline-links',
} as const;

/**
 * Get stored motion preference from localStorage
 */
export function getStoredMotion(): MotionPreference {
  if (typeof window === 'undefined') return 'default';
  try {
    const stored = localStorage.getItem(ACP_STORAGE_KEYS.motion);
    return stored === 'reduced' ? 'reduced' : 'default';
  } catch {
    return 'default';
  }
}

/**
 * Get stored text size preference from localStorage
 */
export function getStoredTextSize(): TextSizePreference {
  if (typeof window === 'undefined') return 'default';
  try {
    const stored = localStorage.getItem(ACP_STORAGE_KEYS.textSize);
    return stored === 'large' ? 'large' : 'default';
  } catch {
    return 'default';
  }
}

/**
 * Get stored underline links preference from localStorage
 */
export function getStoredUnderlineLinks(): UnderlineLinksPreference {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(ACP_STORAGE_KEYS.underlineLinks);
    return stored === 'true';
  } catch {
    return false;
  }
}

/**
 * Get all stored preferences
 */
export function getStoredPreferences(): ACPPreferences {
  return {
    motion: getStoredMotion(),
    textSize: getStoredTextSize(),
    underlineLinks: getStoredUnderlineLinks(),
  };
}

/**
 * Apply motion preference to document root
 * Uses both data-motion attribute and motion-reduce-force class for compatibility
 */
export function applyMotionPreference(preference: MotionPreference): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (preference === 'reduced') {
    root.setAttribute('data-motion', 'reduced');
    root.classList.add('motion-reduce-force');
  } else {
    root.removeAttribute('data-motion');
    root.classList.remove('motion-reduce-force');
  }
}

/**
 * Apply text size preference to document root
 */
export function applyTextSizePreference(preference: TextSizePreference): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (preference === 'large') {
    root.setAttribute('data-text-size', 'large');
  } else {
    root.removeAttribute('data-text-size');
  }
}

/**
 * Apply underline links preference to document root
 */
export function applyUnderlineLinksPreference(
  preference: UnderlineLinksPreference,
): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (preference) {
    root.setAttribute('data-underline-links', 'true');
  } else {
    root.removeAttribute('data-underline-links');
  }
}

/**
 * Store motion preference in localStorage
 */
export function storeMotionPreference(preference: MotionPreference): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACP_STORAGE_KEYS.motion, preference);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Store text size preference in localStorage
 */
export function storeTextSizePreference(preference: TextSizePreference): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACP_STORAGE_KEYS.textSize, preference);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Store underline links preference in localStorage
 */
export function storeUnderlineLinksPreference(
  preference: UnderlineLinksPreference,
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACP_STORAGE_KEYS.underlineLinks, String(preference));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Initialize preferences from localStorage and apply to document
 * Should be called during SSR-safe hydration
 */
export function initializeACPPreferences(): ACPPreferences {
  const preferences = getStoredPreferences();

  applyMotionPreference(preferences.motion);
  applyTextSizePreference(preferences.textSize);
  applyUnderlineLinksPreference(preferences.underlineLinks);

  return preferences;
}
