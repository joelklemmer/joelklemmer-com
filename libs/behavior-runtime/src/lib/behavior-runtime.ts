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

/** Text size preference. */
export type TextSizePreference = 'default' | 'large';

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
  underlineLinks: boolean;
}

// --- Cookie / storage keys (preserved exactly) ---
const COOKIE_THEME = 'joelklemmer-theme';
const COOKIE_CONTRAST = 'joelklemmer-contrast';
const COOKIE_DENSITY = 'joelklemmer-density';
const COOKIE_EVALUATOR = 'evaluator_mode';
const COOKIE_MAX_AGE_DAYS = 365;

const STORAGE_MOTION = 'joelklemmer-motion';
const STORAGE_TEXT_SIZE = 'joelklemmer-text-size';
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

// --- Contrast ---

export function getSystemContrast(): ContrastMode {
  if (typeof window === 'undefined') return 'default';
  return window.matchMedia('(prefers-contrast: more)').matches
    ? 'high'
    : 'default';
}

export function getStoredContrast(): ContrastMode {
  if (typeof window === 'undefined') return 'default';
  const v = getCookie(COOKIE_CONTRAST);
  if (v === 'high') return 'high';
  if (v === 'default') return 'default';
  const fromRoot = document.documentElement.getAttribute('data-contrast');
  return fromRoot === 'high' ? 'high' : 'default';
}

export function setContrast(contrast: ContrastMode): void {
  setCookie(COOKIE_CONTRAST, contrast);
  applyContrastToDocument(contrast);
}

function applyContrastToDocument(contrast: ContrastMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (contrast === 'high') {
    root.setAttribute('data-contrast', 'high');
  } else {
    root.removeAttribute('data-contrast');
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

// --- Motion (localStorage) ---

export function getStoredMotion(): MotionPreference {
  if (typeof window === 'undefined') return 'default';
  try {
    const v = localStorage.getItem(STORAGE_MOTION);
    return v === 'reduced' ? 'reduced' : 'default';
  } catch {
    return 'default';
  }
}

export function setMotion(preference: MotionPreference): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_MOTION, preference);
    }
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (preference === 'reduced') {
        root.setAttribute('data-motion', 'reduced');
        root.classList.add('motion-reduce-force');
      } else {
        root.removeAttribute('data-motion');
        root.classList.remove('motion-reduce-force');
      }
    }
  } catch {
    /* ignore */
  }
}

// --- Text size (localStorage) ---

export function getStoredTextSize(): TextSizePreference {
  if (typeof window === 'undefined') return 'default';
  try {
    const v = localStorage.getItem(STORAGE_TEXT_SIZE);
    return v === 'large' ? 'large' : 'default';
  } catch {
    return 'default';
  }
}

export function setTextSize(preference: TextSizePreference): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_TEXT_SIZE, preference);
    }
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (preference === 'large') {
        root.setAttribute('data-text-size', 'large');
      } else {
        root.removeAttribute('data-text-size');
      }
    }
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
    underlineLinks: getStoredUnderlineLinks(),
  };
}

/** Apply all prefs to documentElement. Call on load and when prefs change. */
export function applyDocumentAttrs(prefs?: Partial<EffectivePrefs>): void {
  if (typeof document === 'undefined') return;

  const stored = computeEffectivePrefs();
  const current = prefs ? { ...stored, ...prefs } : stored;

  applyThemeToDocument(current.theme);
  applyContrastToDocument(current.contrast);

  const root = document.documentElement;

  root.setAttribute('data-density', current.density);
  root.setAttribute('data-evaluator', current.evaluator);

  if (current.motion === 'reduced') {
    root.setAttribute('data-motion', 'reduced');
    root.classList.add('motion-reduce-force');
  } else {
    root.removeAttribute('data-motion');
    root.classList.remove('motion-reduce-force');
  }

  if (current.textSize === 'large') {
    root.setAttribute('data-text-size', 'large');
  } else {
    root.removeAttribute('data-text-size');
  }

  if (current.underlineLinks) {
    root.setAttribute('data-underline-links', 'true');
  } else {
    root.removeAttribute('data-underline-links');
  }
}
