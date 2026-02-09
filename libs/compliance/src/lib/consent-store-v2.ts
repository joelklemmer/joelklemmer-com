/**
 * Client-side persistence for v2 consent state, receipt, and history.
 * Single cookie for consent; receipt and history in localStorage (safe for audit trail).
 */
import type { ConsentState } from './consent-state-v2';
import {
  createDefaultConsentState,
  isConsentStateValid,
  migrateStateFromV1,
  CONSENT_VERSION,
} from './consent-state-v2';
import type { ConsentReceipt } from './receipt';
import { createConsentReceiptSync } from './receipt';

const DEFAULT_COOKIE_NAME = 'consent';
const DEFAULT_COOKIE_MAX_AGE_DAYS = 365;
const DEFAULT_PATH = '/';
const RECEIPT_STORAGE_KEY = 'consent_receipt';

export interface ConsentStoreOptions {
  cookieName?: string;
  maxAgeDays?: number;
  path?: string;
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
          cat: state.categories,
          pur: state.purposes,
          model: state.modelParticipation,
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
      cat?: Record<string, boolean>;
      pur?: Record<string, boolean>;
      model?: boolean;
      a?: boolean;
      f?: boolean;
      m?: boolean;
    };
    if (o.v === 1 && typeof o.a === 'boolean') {
      return migrateStateFromV1({
        version: 1,
        timestamp: o.t ?? 0,
        choiceMade: o.c ?? false,
        analytics: o.a,
        functional: o.f,
        marketing: o.m,
      });
    }
    if (
      typeof o.v !== 'number' ||
      typeof o.t !== 'number' ||
      typeof o.c !== 'boolean' ||
      !o.cat ||
      !o.pur ||
      typeof o.model !== 'boolean'
    ) {
      return null;
    }
    const state: ConsentState = {
      version: o.v,
      timestamp: o.t,
      choiceMade: o.c,
      categories: o.cat,
      purposes: o.pur,
      modelParticipation: o.model,
    };
    return isConsentStateValid(state) ? state : null;
  } catch {
    return null;
  }
}

export function getConsentFromCookieV2(
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

export function readConsentFromDocumentV2(
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

export function writeConsentToDocumentV2(
  state: ConsentState,
  options: ConsentStoreOptions = {},
): void {
  if (typeof document === 'undefined') return;
  const name = options.cookieName ?? DEFAULT_COOKIE_NAME;
  const maxAgeDays = options.maxAgeDays ?? DEFAULT_COOKIE_MAX_AGE_DAYS;
  const path = options.path ?? DEFAULT_PATH;
  const value = stateToValue(state);
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}; max-age=${maxAge}; SameSite=Lax`;
}

export function clearConsentCookieV2(options: ConsentStoreOptions = {}): void {
  if (typeof document === 'undefined') return;
  const name = options.cookieName ?? DEFAULT_COOKIE_NAME;
  const path = options.path ?? DEFAULT_PATH;
  document.cookie = `${encodeURIComponent(name)}=; path=${path}; max-age=0; SameSite=Lax`;
}

export function persistReceipt(receipt: ConsentReceipt): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(receipt));
  } catch {
    // ignore
  }
}

export function readStoredReceipt(): ConsentReceipt | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RECEIPT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentReceipt;
  } catch {
    return null;
  }
}

export function clearStoredReceipt(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(RECEIPT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function saveConsentWithReceipt(state: ConsentState): void {
  writeConsentToDocumentV2(state);
  const receipt = createConsentReceiptSync(state);
  persistReceipt(receipt);
}
