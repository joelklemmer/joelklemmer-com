/**
 * Policy adapter for v2 consent: category and purpose gates.
 * Non-essential scripts/embeds/telemetry only when consent permits.
 */
import type { ConsentState } from './consent-state-v2';
import type { ConsentCategory, PurposeScope } from './categories';

export function canLoadCategoryV2(
  state: ConsentState | null,
  category: ConsentCategory,
): boolean {
  if (!state?.choiceMade) return false;
  if (category === 'essential') return true;
  return state.categories[category] === true;
}

export function canLoadAnalyticsV2(state: ConsentState | null): boolean {
  return canLoadCategoryV2(state, 'analytics');
}

export function canLoadFunctionalV2(state: ConsentState | null): boolean {
  return canLoadCategoryV2(state, 'functional');
}

export function canLoadMarketingV2(state: ConsentState | null): boolean {
  return canLoadCategoryV2(state, 'marketing');
}

export function canLoadExperienceV2(state: ConsentState | null): boolean {
  return canLoadCategoryV2(state, 'experience');
}

export function hasPurpose(
  state: ConsentState | null,
  purpose: PurposeScope,
): boolean {
  if (!state?.choiceMade) return false;
  return state.purposes[purpose] === true;
}

export function canLoadNonEssentialV2(state: ConsentState | null): boolean {
  if (!state?.choiceMade) return false;
  const { categories } = state;
  return (
    categories.analytics === true ||
    categories.functional === true ||
    categories.experience === true ||
    categories.marketing === true
  );
}

/** Personalization/profiling gates: only when explicit purpose enabled. */
export function canUsePersonalization(state: ConsentState | null): boolean {
  return hasPurpose(state, 'personalization') || hasPurpose(state, 'profiling');
}
