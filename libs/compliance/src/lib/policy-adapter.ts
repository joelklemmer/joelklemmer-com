/**
 * Policy adapter: region-aware default. Currently defaults to strict opt-in globally.
 * Non-essential scripts must not load until consent is given.
 */
import type { ConsentState } from './consent-state';

export type RegionHint = 'eu' | 'uk' | 'default';

/**
 * For a given region, whether we require explicit consent before non-essential scripts.
 * Default: true (strict opt-in everywhere).
 */
export function requiresExplicitConsent(_region?: RegionHint): boolean {
  return true;
}

/**
 * Gate: may we load analytics scripts? Only when consent.analytics is true.
 */
export function canLoadAnalytics(state: ConsentState | null): boolean {
  return state?.choiceMade === true && state?.analytics === true;
}

/**
 * Gate: may we load functional (e.g. preference) scripts? Only when consent.functional is true.
 */
export function canLoadFunctional(state: ConsentState | null): boolean {
  return state?.choiceMade === true && state?.functional === true;
}

/**
 * Gate: may we load marketing scripts? Only when consent.marketing is true.
 */
export function canLoadMarketing(state: ConsentState | null): boolean {
  return state?.choiceMade === true && state?.marketing === true;
}

/**
 * Combined: may we load any non-essential script? (analytics, functional, or marketing)
 */
export function canLoadNonEssential(state: ConsentState | null): boolean {
  return (
    state?.choiceMade === true &&
    (state.analytics === true ||
      state.functional === true ||
      state.marketing === true)
  );
}
