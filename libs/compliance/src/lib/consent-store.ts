/**
 * Client-side consent persistence. Uses a single cookie set only after user action.
 * Pre-consent: no preference cookie is set (essential-only).
 * Cookie name and path are configurable for policy alignment.
 */
import type { ConsentState } from './consent-state';
import {
  createDefaultConsentState,
  isConsentStateValid,
  CONSENT_VERSION,
} from './consent-state';

const DEFAULT_COOKIE_NAME = 'consent';
const DEFAULT_COOKIE_MAX_AGE_DAYS = 365;
const DEFAULT_PATH = '/';

export interface ConsentStoreOptions {
  cookieName?: string;
  maxAgeDays?: number;
  path?: string;
}

function getCookieString(
  name: string,
  value: string,
  maxAgeDays: number,
  path: string,
): string {
  const maxAge = maxAgeDays * 24 * 60 * 60;
  return `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}; max-age=${maxAge}; SameSite=Lax`;
}

function parseCookieHeader(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  header.split(';').forEach((part) => {
    const eq = part.indexOf('=');
    if (eq === -1) return;
    const key = decodeURIComponent(part.slice(0, eq).trim());
    const val = decodeURIComponent(part.slice(eq + 1).trim());
    if (key && val) out[key] = val;
  });
  return out;
}

function stateToValue(state: ConsentState): string {
  return btoa(
    unescape(
      encodeURIComponent(
        JSON.stringify({
          v: state.version,
          t: state.timestamp,
          c: state.choiceMade,
          a: state.analytics,
          f: state.functional,
          m: state.marketing,
        }),
      ),
    ),
  );
}

function valueToState(value: string): ConsentState | null {
  try {
    const raw = decodeURIComponent(escape(atob(value)));
    const o = JSON.parse(raw) as {
      v?: number;
      t?: number;
      c?: boolean;
      a?: boolean;
      f?: boolean;
      m?: boolean;
    };
    if (
      typeof o.v !== 'number' ||
      typeof o.t !== 'number' ||
      typeof o.c !== 'boolean' ||
      typeof o.a !== 'boolean' ||
      typeof o.f !== 'boolean' ||
      typeof o.m !== 'boolean'
    ) {
      return null;
    }
    const state: ConsentState = {
      version: o.v,
      timestamp: o.t,
      choiceMade: o.c,
      analytics: o.a,
      functional: o.f,
      marketing: o.m,
    };
    return isConsentStateValid(state) ? state : null;
  } catch {
    return null;
  }
}

/**
 * Parse consent from a Cookie header (e.g. in server component or middleware).
 * Returns null if no valid consent cookie or version mismatch.
 */
export function getConsentFromCookie(
  cookieHeader: string,
  options: ConsentStoreOptions = {},
): ConsentState | null {
  const name = options.cookieName ?? DEFAULT_COOKIE_NAME;
  const cookies = parseCookieHeader(cookieHeader);
  const value = cookies[name];
  if (!value) return null;
  const state = valueToState(value);
  if (!state || state.version !== CONSENT_VERSION) return null;
  return state;
}

/**
 * Client-only: read consent from document.cookie. Returns null if no cookie or invalid.
 */
export function readConsentFromDocument(
  options: ConsentStoreOptions = {},
): ConsentState | null {
  if (typeof document === 'undefined' || !document.cookie) return null;
  const name = options.cookieName ?? DEFAULT_COOKIE_NAME;
  const cookies = parseCookieHeader(document.cookie);
  const value = cookies[name];
  if (!value) return null;
  const state = valueToState(value);
  if (!state || state.version !== CONSENT_VERSION) return null;
  return state;
}

/**
 * Client-only: write consent cookie. Call only after user action (e.g. save preferences).
 */
export function writeConsentToDocument(
  state: ConsentState,
  options: ConsentStoreOptions = {},
): void {
  if (typeof document === 'undefined') return;
  const name = options.cookieName ?? DEFAULT_COOKIE_NAME;
  const maxAgeDays = options.maxAgeDays ?? DEFAULT_COOKIE_MAX_AGE_DAYS;
  const path = options.path ?? DEFAULT_PATH;
  const value = stateToValue(state);
  document.cookie = getCookieString(name, value, maxAgeDays, path);
}

/**
 * Client-only: remove consent cookie (e.g. withdraw consent).
 */
export function clearConsentCookie(options: ConsentStoreOptions = {}): void {
  if (typeof document === 'undefined') return;
  const name = options.cookieName ?? DEFAULT_COOKIE_NAME;
  const path = options.path ?? DEFAULT_PATH;
  document.cookie = `${encodeURIComponent(name)}=; path=${path}; max-age=0; SameSite=Lax`;
}
