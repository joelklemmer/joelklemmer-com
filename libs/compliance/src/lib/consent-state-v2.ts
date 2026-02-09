/**
 * Versioned consent state with categories, purpose scopes, and model participation.
 * Bump CONSENT_VERSION when policy or categories change.
 */
import type { ConsentCategory, PurposeScope } from './categories';

export const CONSENT_VERSION = 2;

export interface ConsentState {
  version: number;
  timestamp: number;
  choiceMade: boolean;
  /** Category toggles. essential is always true at runtime. */
  categories: Record<ConsentCategory, boolean>;
  /** Purpose-level consent. Used for vendor activation and telemetry emission. */
  purposes: Record<PurposeScope, boolean>;
  /** AI/model training participation. Withdrawal must clear this. */
  modelParticipation: boolean;
}

export function createDefaultConsentState(): ConsentState {
  return {
    version: CONSENT_VERSION,
    timestamp: 0,
    choiceMade: false,
    categories: {
      essential: true,
      functional: false,
      analytics: false,
      experience: false,
      marketing: false,
    },
    purposes: {
      measurement: false,
      experimentation: false,
      personalization: false,
      security: false,
      fraud: false,
      recommendation: false,
      profiling: false,
    },
    modelParticipation: false,
  };
}

export function createAcceptedAllConsentState(): ConsentState {
  return {
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    choiceMade: true,
    categories: {
      essential: true,
      functional: true,
      analytics: true,
      experience: true,
      marketing: true,
    },
    purposes: {
      measurement: true,
      experimentation: true,
      personalization: true,
      security: true,
      fraud: true,
      recommendation: true,
      profiling: true,
    },
    modelParticipation: false,
  };
}

export function createRejectNonEssentialConsentState(): ConsentState {
  return {
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    choiceMade: true,
    categories: {
      essential: true,
      functional: false,
      analytics: false,
      experience: false,
      marketing: false,
    },
    purposes: {
      measurement: false,
      experimentation: false,
      personalization: false,
      security: false,
      fraud: false,
      recommendation: false,
      profiling: false,
    },
    modelParticipation: false,
  };
}

export function isConsentStateValid(state: ConsentState): boolean {
  if (
    typeof state !== 'object' ||
    state === null ||
    state.version !== CONSENT_VERSION
  ) {
    return false;
  }
  const cats = state.categories;
  const purps = state.purposes;
  return (
    typeof state.choiceMade === 'boolean' &&
    typeof state.modelParticipation === 'boolean' &&
    typeof cats?.essential === 'boolean' &&
    typeof cats?.functional === 'boolean' &&
    typeof cats?.analytics === 'boolean' &&
    typeof cats?.experience === 'boolean' &&
    typeof cats?.marketing === 'boolean' &&
    typeof purps?.measurement === 'boolean' &&
    typeof purps?.experimentation === 'boolean' &&
    typeof purps?.personalization === 'boolean' &&
    typeof purps?.security === 'boolean' &&
    typeof purps?.fraud === 'boolean' &&
    typeof purps?.recommendation === 'boolean' &&
    typeof purps?.profiling === 'boolean'
  );
}

/** Backward compatibility: map v1 state to v2 if needed (used when reading legacy cookie). */
export function migrateStateFromV1(legacy: {
  version: number;
  timestamp: number;
  choiceMade: boolean;
  analytics?: boolean;
  functional?: boolean;
  marketing?: boolean;
}): ConsentState {
  const s = createDefaultConsentState();
  s.version = CONSENT_VERSION;
  s.timestamp = legacy.timestamp;
  s.choiceMade = legacy.choiceMade;
  s.categories.analytics = legacy.analytics ?? false;
  s.categories.functional = legacy.functional ?? false;
  s.categories.marketing = legacy.marketing ?? false;
  return s;
}
