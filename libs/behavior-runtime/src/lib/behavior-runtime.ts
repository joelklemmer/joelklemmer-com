/**
 * BehaviorRuntime: shared logic layer for all behavioral engines.
 * No UI. Preserves cookie names, localStorage keys, and data-* attributes.
 * Callable from client components and small inline initializers.
 */

/** Stored theme value: light, dark, or system (resolved at apply time). */
export type Theme = 'light' | 'dark' | 'system';

/** Resolved theme always light or dark (never system on documentElement). */
export type ResolvedTheme = 'light' | 'dark';

/** Contrast mode. */
export type ContrastMode = 'default' | 'high';

/** Motion preference. */
export type MotionPreference = 'default' | 'reduced';

/** Text size preference: 100%, 112%, 125%. */
export type TextSizePreference = 'default' | 'medium' | 'large';

/** Line height preference. */
export type LineHeightPreference = 'default' | 'comfortable';

/** Letter spacing preference. */
export type LetterSpacingPreference = 'default' | 'increased';

/** Accessibility preferences: canonical contract for root application. */
export type AccessibilityPrefs = {
  contrast: 'default' | 'high';
  motion: 'full' | 'reduced';
  textScale: '1' | '1.12' | '1.25';
  lineHeight: 'default' | 'comfortable';
  letterSpacing: 'default' | 'increased';
  dyslexiaFont: boolean;
};

/** Evaluator mode. */
export type EvaluatorMode =
  | 'executive'
  | 'board'
  | 'public_service'
  | 'investor'
  | 'media'
  | 'default';

/** Effective preferences applied to document root. */
export interface EffectivePrefs {
  theme: ResolvedTheme;
  contrast: ContrastMode;
  density: 'on' | 'off';
  evaluator: EvaluatorMode;
  motion: MotionPreference;
  textSize: TextSizePreference;
  lineHeight: LineHeightPreference;
  letterSpacing: LetterSpacingPreference;
  dyslexiaFont: boolean;
  underlineLinks: boolean;
}

// --- Cookie / storage keys (preserved exactly) ---
const COOKIE_THEME = 'joelklemmer-theme';
const COOKIE_DENSITY = 'joelklemmer-density';
const COOKIE_EVALUATOR = 'evaluator_mode';
const COOKIE_MAX_AGE_DAYS = 365;

// Accessibility: single unified localStorage key (canonical)
const STORAGE_A11Y_PREFS = 'joelklemmer-a11y-prefs';

// Legacy keys for migration only
const STORAGE_CONTRAST_LEGACY = 'joelklemmer-contrast';
const STORAGE_REDUCE_MOTION_LEGACY = 'joelklemmer-reduce-motion';
const STORAGE_MOTION_LEGACY = 'joelklemmer-motion';
const STORAGE_TEXT_SIZE_LEGACY = 'joelklemmer-text-size';
const STORAGE_LINE_HEIGHT_LEGACY = 'joelklemmer-line-height';
const STORAGE_LETTER_SPACING_LEGACY = 'joelklemmer-letter-spacing';
const STORAGE_DYSLEXIA_FONT_LEGACY = 'joelklemmer-dyslexia-font';
const STORAGE_UNDERLINE_LINKS = 'joelklemmer-underline-links';

const VALID_EVALUATOR = new Set<string>([
  'executive',
  'board',
  'public_service',
  'investor',
  'media',
  'default',
]);

function getCookie(name: string): string | null {
  if (typeof document === 'undefined' || !document.cookie) return null;
  const m = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}\\s*=\\s*([^;]*)`),
  );
  return m?.[1]?.trim() ?? null;
}

function setCookie(name: string, value: string): void {
  try {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${
      COOKIE_MAX_AGE_DAYS * 86400
    }; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

// --- Theme ---

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const v = getCookie(COOKIE_THEME);
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  const fromRoot = document.documentElement.getAttribute('data-theme');
  if (fromRoot === 'light' || fromRoot === 'dark') return fromRoot;
  return 'system';
}

export function setTheme(theme: Theme): void {
  setCookie(COOKIE_THEME, theme);
  applyThemeToDocument(theme);
}

function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', resolved);
}

// --- Contrast (localStorage for root-level application) ---

export function getSystemContrast(): ContrastMode {
  if (typeof window === 'undefined') return 'default';
  return window.matchMedia('(prefers-contrast: more)').matches
    ? 'high'
    : 'default';
}

export function getStoredContrast(): ContrastMode {
  return readAccessibilityPrefs().contrast;
}

export function setContrast(contrast: ContrastMode): void {
  try {
    setAccessibilityPref({ contrast });
  } catch {
    /* ignore */
  }
}

// --- Density ---

export function getStoredDensity(): 'on' | 'off' {
  if (typeof window === 'undefined') return 'off';
  const v = getCookie(COOKIE_DENSITY);
  return v === 'on' ? 'on' : 'off';
}

export function setDensity(on: boolean): void {
  const value = on ? 'on' : 'off';
  setCookie(COOKIE_DENSITY, value);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-density', value);
  }
}

// --- Evaluator ---

export function getStoredEvaluator(): EvaluatorMode {
  if (typeof window === 'undefined') return 'default';
  const v = getCookie(COOKIE_EVALUATOR);
  return VALID_EVALUATOR.has(v ?? '') ? (v as EvaluatorMode) : 'default';
}

export function setEvaluator(mode: EvaluatorMode): void {
  setCookie(COOKIE_EVALUATOR, mode);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-evaluator', mode);
  }
}

/** Accessibility prefs shape for legacy applyAccessibilityPreferences. */
export interface AccessibilityPreferences {
  contrast?: ContrastMode;
  reduceMotion?: boolean;
  textSize?: TextSizePreference;
  lineHeight?: LineHeightPreference;
  letterSpacing?: LetterSpacingPreference;
  dyslexiaFont?: boolean;
}

const DEFAULT_ACCESSIBILITY_PREFS: AccessibilityPrefs = {
  contrast: 'default',
  motion: 'full',
  textScale: '1',
  lineHeight: 'default',
  letterSpacing: 'default',
  dyslexiaFont: false,
};

function migrateLegacyToPrefs(): AccessibilityPrefs {
  const prefs = { ...DEFAULT_ACCESSIBILITY_PREFS };
  try {
    const contrast = localStorage.getItem(STORAGE_CONTRAST_LEGACY);
    if (contrast === 'high') prefs.contrast = 'high';

    const rm = localStorage.getItem(STORAGE_REDUCE_MOTION_LEGACY);
    const legacyM = localStorage.getItem(STORAGE_MOTION_LEGACY);
    if (rm === 'true' || legacyM === 'reduced') prefs.motion = 'reduced';

    const t = localStorage.getItem(STORAGE_TEXT_SIZE_LEGACY);
    if (t === 'medium') prefs.textScale = '1.12';
    else if (t === 'large') prefs.textScale = '1.25';

    const lh = localStorage.getItem(STORAGE_LINE_HEIGHT_LEGACY);
    if (lh === 'comfortable') prefs.lineHeight = 'comfortable';

    const ls = localStorage.getItem(STORAGE_LETTER_SPACING_LEGACY);
    if (ls === 'increased') prefs.letterSpacing = 'increased';

    const df = localStorage.getItem(STORAGE_DYSLEXIA_FONT_LEGACY);
    if (df === 'true') prefs.dyslexiaFont = true;
  } catch {
    /* ignore */
  }
  return prefs;
}

/**
 * Read accessibility preferences from localStorage. Returns defaults when missing.
 * Reads unified key first; falls back to legacy keys and migrates.
 */
export function readAccessibilityPrefs(): AccessibilityPrefs {
  if (typeof window === 'undefined') return { ...DEFAULT_ACCESSIBILITY_PREFS };
  try {
    const raw = localStorage.getItem(STORAGE_A11Y_PREFS);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const prefs: AccessibilityPrefs = {
        contrast:
          parsed.contrast === 'high'
            ? 'high'
            : DEFAULT_ACCESSIBILITY_PREFS.contrast,
        motion:
          parsed.motion === 'reduced'
            ? 'reduced'
            : DEFAULT_ACCESSIBILITY_PREFS.motion,
        textScale:
          parsed.textScale === '1.12' || parsed.textScale === '1.25'
            ? parsed.textScale
            : DEFAULT_ACCESSIBILITY_PREFS.textScale,
        lineHeight:
          parsed.lineHeight === 'comfortable'
            ? 'comfortable'
            : DEFAULT_ACCESSIBILITY_PREFS.lineHeight,
        letterSpacing:
          parsed.letterSpacing === 'increased'
            ? 'increased'
            : DEFAULT_ACCESSIBILITY_PREFS.letterSpacing,
        dyslexiaFont:
          typeof parsed.dyslexiaFont === 'boolean'
            ? parsed.dyslexiaFont
            : DEFAULT_ACCESSIBILITY_PREFS.dyslexiaFont,
      };
      return prefs;
    }
    const migrated = migrateLegacyToPrefs();
    persistAccessibilityPrefs(migrated);
    clearLegacyKeys();
    return migrated;
  } catch {
    return { ...DEFAULT_ACCESSIBILITY_PREFS };
  }
}

function clearLegacyKeys(): void {
  try {
    localStorage.removeItem(STORAGE_CONTRAST_LEGACY);
    localStorage.removeItem(STORAGE_REDUCE_MOTION_LEGACY);
    localStorage.removeItem(STORAGE_MOTION_LEGACY);
    localStorage.removeItem(STORAGE_TEXT_SIZE_LEGACY);
    localStorage.removeItem(STORAGE_LINE_HEIGHT_LEGACY);
    localStorage.removeItem(STORAGE_LETTER_SPACING_LEGACY);
    localStorage.removeItem(STORAGE_DYSLEXIA_FONT_LEGACY);
  } catch {
    /* ignore */
  }
}

/**
 * Apply accessibility preferences to documentElement (html) only.
 * Canonical contract: data-contrast, data-motion, data-text-scale, data-line-height,
 * data-letter-spacing, data-dyslexia-font; --jk-text-scale, --jk-line-height, --jk-letter-spacing.
 */
export function applyAccessibilityPrefsToRoot(prefs: AccessibilityPrefs): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (prefs.contrast === 'high') {
    root.setAttribute('data-contrast', 'high');
  } else {
    root.removeAttribute('data-contrast');
  }

  if (prefs.motion === 'reduced') {
    root.setAttribute('data-motion', 'reduced');
  } else {
    root.removeAttribute('data-motion');
  }

  root.setAttribute('data-text-scale', prefs.textScale);
  root.style.setProperty('--jk-text-scale', prefs.textScale);

  if (prefs.lineHeight === 'comfortable') {
    root.setAttribute('data-line-height', 'comfortable');
    root.style.setProperty('--jk-line-height', '1.6');
  } else {
    root.removeAttribute('data-line-height');
    root.style.removeProperty('--jk-line-height');
  }

  if (prefs.letterSpacing === 'increased') {
    root.setAttribute('data-letter-spacing', 'increased');
    root.style.setProperty('--jk-letter-spacing', '0.02em');
  } else {
    root.removeAttribute('data-letter-spacing');
    root.style.removeProperty('--jk-letter-spacing');
  }

  if (prefs.dyslexiaFont) {
    root.setAttribute('data-dyslexia-font', 'true');
  } else {
    root.removeAttribute('data-dyslexia-font');
  }
}

/**
 * Persist accessibility preferences to localStorage.
 * Uses single key joelklemmer-a11y-prefs with JSON.
 */
export function persistAccessibilityPrefs(prefs: AccessibilityPrefs): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_A11Y_PREFS, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

/**
 * Set one or more accessibility prefs, merge with current, persist, apply to root.
 * Returns the new merged prefs.
 */
export function setAccessibilityPref(
  partial: Partial<AccessibilityPrefs>,
): AccessibilityPrefs {
  const current = readAccessibilityPrefs();
  const next: AccessibilityPrefs = { ...current, ...partial };
  persistAccessibilityPrefs(next);
  applyAccessibilityPrefsToRoot(next);
  return next;
}

/**
 * Clear all accessibility keys and remove all related html attributes and css vars.
 */
export function resetAccessibilityPrefs(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_A11Y_PREFS);
    clearLegacyKeys();
  } catch {
    /* ignore */
  }
  const root = document.documentElement;
  root.removeAttribute('data-contrast');
  root.removeAttribute('data-motion');
  root.removeAttribute('data-text-scale');
  root.removeAttribute('data-line-height');
  root.removeAttribute('data-letter-spacing');
  root.removeAttribute('data-dyslexia-font');
  root.style.removeProperty('--jk-text-scale');
  root.style.removeProperty('--jk-line-height');
  root.style.removeProperty('--jk-letter-spacing');
}

/**
 * Apply accessibility preferences (legacy API). Maps old shape to canonical prefs.
 */
export function applyAccessibilityPreferences(
  prefs: Partial<AccessibilityPreferences>,
): void {
  if (Object.keys(prefs).length === 0) return;
  const current = readAccessibilityPrefs();
  const next: AccessibilityPrefs = {
    ...current,
    ...(prefs.contrast !== undefined && { contrast: prefs.contrast }),
    ...(prefs.reduceMotion !== undefined && {
      motion: prefs.reduceMotion ? 'reduced' : 'full',
    }),
    ...(prefs.textSize !== undefined && {
      textScale:
        prefs.textSize === 'large'
          ? '1.25'
          : prefs.textSize === 'medium'
            ? '1.12'
            : '1',
    }),
    ...(prefs.lineHeight !== undefined && { lineHeight: prefs.lineHeight }),
    ...(prefs.letterSpacing !== undefined && {
      letterSpacing: prefs.letterSpacing,
    }),
    ...(prefs.dyslexiaFont !== undefined && {
      dyslexiaFont: prefs.dyslexiaFont,
    }),
  };
  persistAccessibilityPrefs(next);
  applyAccessibilityPrefsToRoot(next);
}

// --- Motion (localStorage) ---

export function getStoredMotion(): MotionPreference {
  return readAccessibilityPrefs().motion === 'reduced' ? 'reduced' : 'default';
}

export function setMotion(preference: MotionPreference): void {
  try {
    setAccessibilityPref({
      motion: preference === 'reduced' ? 'reduced' : 'full',
    });
  } catch {
    /* ignore */
  }
}

// --- Text size (localStorage) ---

export function getStoredTextSize(): TextSizePreference {
  const scale = readAccessibilityPrefs().textScale;
  return scale === '1.25' ? 'large' : scale === '1.12' ? 'medium' : 'default';
}

export function setTextSize(preference: TextSizePreference): void {
  try {
    const textScale =
      preference === 'large' ? '1.25' : preference === 'medium' ? '1.12' : '1';
    setAccessibilityPref({ textScale });
  } catch {
    /* ignore */
  }
}

// --- Line height (localStorage) ---

export function getStoredLineHeight(): LineHeightPreference {
  return readAccessibilityPrefs().lineHeight;
}

export function setLineHeight(preference: LineHeightPreference): void {
  try {
    setAccessibilityPref({ lineHeight: preference });
  } catch {
    /* ignore */
  }
}

// --- Letter spacing (localStorage) ---

export function getStoredLetterSpacing(): LetterSpacingPreference {
  return readAccessibilityPrefs().letterSpacing;
}

export function setLetterSpacing(preference: LetterSpacingPreference): void {
  try {
    setAccessibilityPref({ letterSpacing: preference });
  } catch {
    /* ignore */
  }
}

// --- Dyslexia-friendly font (localStorage) ---

export function getStoredDyslexiaFont(): boolean {
  return readAccessibilityPrefs().dyslexiaFont;
}

export function setDyslexiaFont(on: boolean): void {
  try {
    setAccessibilityPref({ dyslexiaFont: on });
  } catch {
    /* ignore */
  }
}

// --- Underline links (localStorage) ---

export function getStoredUnderlineLinks(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_UNDERLINE_LINKS) === 'true';
  } catch {
    return false;
  }
}

export function setUnderlineLinks(on: boolean): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_UNDERLINE_LINKS, String(on));
    }
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (on) {
        root.setAttribute('data-underline-links', 'true');
      } else {
        root.removeAttribute('data-underline-links');
      }
    }
  } catch {
    /* ignore */
  }
}

// --- Compute effective prefs (merge stored + system) ---

export function computeEffectivePrefs(): EffectivePrefs {
  const theme = getStoredTheme();
  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

  let contrast = getStoredContrast();
  if (contrast === 'default' && typeof window !== 'undefined') {
    contrast = getSystemContrast();
  }

  return {
    theme: resolvedTheme,
    contrast,
    density: getStoredDensity(),
    evaluator: getStoredEvaluator(),
    motion: getStoredMotion(),
    textSize: getStoredTextSize(),
    lineHeight: getStoredLineHeight(),
    letterSpacing: getStoredLetterSpacing(),
    dyslexiaFont: getStoredDyslexiaFont(),
    underlineLinks: getStoredUnderlineLinks(),
  };
}

/** Apply all prefs to documentElement. Call on load and when prefs change. */
export function applyDocumentAttrs(prefs?: Partial<EffectivePrefs>): void {
  if (typeof document === 'undefined') return;

  const stored = computeEffectivePrefs();
  const current = prefs ? { ...stored, ...prefs } : stored;

  applyThemeToDocument(current.theme);

  const a11yPrefs: AccessibilityPrefs = {
    contrast: current.contrast,
    motion: current.motion === 'reduced' ? 'reduced' : 'full',
    textScale:
      current.textSize === 'large'
        ? '1.25'
        : current.textSize === 'medium'
          ? '1.12'
          : '1',
    lineHeight: current.lineHeight,
    letterSpacing: current.letterSpacing,
    dyslexiaFont: current.dyslexiaFont,
  };
  applyAccessibilityPrefsToRoot(a11yPrefs);

  const root = document.documentElement;
  root.setAttribute('data-density', current.density);
  root.setAttribute('data-evaluator', current.evaluator);

  if (current.underlineLinks) {
    root.setAttribute('data-underline-links', 'true');
  } else {
    root.removeAttribute('data-underline-links');
  }
}
