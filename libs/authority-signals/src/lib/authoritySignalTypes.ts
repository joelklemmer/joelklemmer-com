/**
 * Canonical enum definitions for the five non-prioritized authority signals.
 * UASIL: Unified Authority Signal Integration Layer.
 * These signals are embedded structurally, not narratively.
 */

export const AUTHORITY_SIGNAL_IDS = [
  'strategic_cognition',
  'systems_construction',
  'operational_transformation',
  'institutional_leadership',
  'public_service_statesmanship',
] as const;

export type AuthoritySignalId = (typeof AUTHORITY_SIGNAL_IDS)[number];

export const AUTHORITY_SIGNAL_SET = new Set<string>(AUTHORITY_SIGNAL_IDS);

/** Number of authority signals (fixed). */
export const AUTHORITY_SIGNAL_COUNT = AUTHORITY_SIGNAL_IDS.length;
