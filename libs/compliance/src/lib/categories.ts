/**
 * Consent categories and purpose scopes. Single source of truth for policy surfaces.
 */

export const CONSENT_CATEGORIES = [
  'essential',
  'functional',
  'analytics',
  'experience',
  'marketing',
] as const;

export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];

export const PURPOSE_SCOPES = [
  'measurement',
  'experimentation',
  'personalization',
  'security',
  'fraud',
  'recommendation',
  'profiling',
] as const;

export type PurposeScope = (typeof PURPOSE_SCOPES)[number];

export const DATA_SENSITIVITY_LEVELS = [
  'operational',
  'behavioral',
  'inferred',
  'identityLinked',
  'crossContext',
] as const;

export type DataSensitivity = (typeof DATA_SENSITIVITY_LEVELS)[number];

/** Essential is always on; not a user toggle. */
export const ESSENTIAL_CATEGORY: ConsentCategory = 'essential';

export function isEssentialCategory(cat: ConsentCategory): boolean {
  return cat === ESSENTIAL_CATEGORY;
}

export function isNonEssentialCategory(cat: ConsentCategory): boolean {
  return !isEssentialCategory(cat);
}
