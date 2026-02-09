/**
 * Versioned consent state. Bump CONSENT_VERSION when policy or categories change
 * so stored values can be invalidated and re-prompted if needed.
 */
export const CONSENT_VERSION = 1;

export type ConsentCategory =
  | 'essential'
  | 'analytics'
  | 'functional'
  | 'marketing';

export interface ConsentState {
  version: number;
  /** Timestamp when the user made the choice (ms). */
  timestamp: number;
  /** User has explicitly made a choice (accept all, reject non-essential, or custom). */
  choiceMade: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

/** Essential is always true; not stored as a preference. */
export function createDefaultConsentState(): ConsentState {
  return {
    version: CONSENT_VERSION,
    timestamp: 0,
    choiceMade: false,
    analytics: false,
    functional: false,
    marketing: false,
  };
}

export function createAcceptedAllConsentState(): ConsentState {
  return {
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    choiceMade: true,
    analytics: true,
    functional: true,
    marketing: true,
  };
}

export function createRejectNonEssentialConsentState(): ConsentState {
  return {
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    choiceMade: true,
    analytics: false,
    functional: false,
    marketing: false,
  };
}

export function isConsentStateValid(state: ConsentState): boolean {
  return (
    typeof state === 'object' &&
    state !== null &&
    state.version === CONSENT_VERSION &&
    typeof state.choiceMade === 'boolean' &&
    typeof state.analytics === 'boolean' &&
    typeof state.functional === 'boolean' &&
    typeof state.marketing === 'boolean'
  );
}
