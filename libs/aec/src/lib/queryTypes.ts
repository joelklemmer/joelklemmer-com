/**
 * AEC constrained query intents. Deterministic retrieval only; no open-ended chat.
 */

export const AEC_QUERY_INTENTS = [
  'summarize_framework',
  'trace_evidence_chain',
  'compare_claims',
  'explore_domain',
  'extract_decision_model',
] as const;

export type AECQueryIntent = (typeof AEC_QUERY_INTENTS)[number];

export function isAECQueryIntent(value: string): value is AECQueryIntent {
  return (AEC_QUERY_INTENTS as readonly string[]).includes(value);
}
