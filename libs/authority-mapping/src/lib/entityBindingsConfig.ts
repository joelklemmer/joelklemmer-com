/**
 * Default signal bindings for known content entities.
 * Each major entity (claim, record, case study, book, brief node) has a weight vector.
 * Weights are 0–1 per signal; vectors are normalized for balanced coverage.
 * Extension: add new entities here when content is added.
 */

import type { AuthoritySignalId } from '@joelklemmer/authority-signals';
import type { SignalWeightVector } from '@joelklemmer/authority-signals';

export type EntityBindingConfig = {
  entityKind:
    | 'claim'
    | 'record'
    | 'caseStudy'
    | 'book'
    | 'briefNode'
    | 'framework';
  entityId: string;
  signalVector: SignalWeightVector;
};

/** Balanced default: equal weight across all five signals (0.2 each). */
function balancedVector(): Partial<Record<AuthoritySignalId, number>> {
  return {
    strategic_cognition: 0.2,
    systems_construction: 0.2,
    operational_transformation: 0.2,
    institutional_leadership: 0.2,
    public_service_statesmanship: 0.2,
  };
}

/** Emphasize one signal, rest equal. */
function withPrimary(
  primary: AuthoritySignalId,
  primaryWeight: number,
): Partial<Record<AuthoritySignalId, number>> {
  const rest = (1 - primaryWeight) / 4;
  return {
    strategic_cognition:
      primary === 'strategic_cognition' ? primaryWeight : rest,
    systems_construction:
      primary === 'systems_construction' ? primaryWeight : rest,
    operational_transformation:
      primary === 'operational_transformation' ? primaryWeight : rest,
    institutional_leadership:
      primary === 'institutional_leadership' ? primaryWeight : rest,
    public_service_statesmanship:
      primary === 'public_service_statesmanship' ? primaryWeight : rest,
  };
}

/**
 * Canonical list of entity bindings. Every claim, record, case study, book,
 * and the executive brief node should appear here. Validator ensures no gaps.
 */
export const ENTITY_BINDINGS_CONFIG: EntityBindingConfig[] = [
  // Claims
  {
    entityKind: 'claim',
    entityId: 'recovery-plan-speed',
    signalVector: { weights: withPrimary('operational_transformation', 0.4) },
  },
  {
    entityKind: 'claim',
    entityId: 'executive-brief-evaluation',
    signalVector: { weights: withPrimary('institutional_leadership', 0.4) },
  },
  {
    entityKind: 'claim',
    entityId: 'procurement-governance',
    signalVector: { weights: withPrimary('institutional_leadership', 0.4) },
  },
  {
    entityKind: 'claim',
    entityId: 'accessibility-compliance',
    signalVector: { weights: withPrimary('public_service_statesmanship', 0.4) },
  },
  {
    entityKind: 'claim',
    entityId: 'security-disclosure',
    signalVector: { weights: withPrimary('public_service_statesmanship', 0.4) },
  },
  {
    entityKind: 'claim',
    entityId: 'content-os-pgf',
    signalVector: { weights: withPrimary('systems_construction', 0.4) },
  },
  {
    entityKind: 'claim',
    entityId: 'intelligence-graph',
    signalVector: { weights: withPrimary('systems_construction', 0.4) },
  },
  {
    entityKind: 'claim',
    entityId: 'case-study-evidence',
    signalVector: { weights: withPrimary('operational_transformation', 0.4) },
  },
  {
    entityKind: 'claim',
    entityId: 'delivery-governance',
    signalVector: { weights: withPrimary('operational_transformation', 0.4) },
  },
  {
    entityKind: 'claim',
    entityId: 'policy-verification',
    signalVector: { weights: balancedVector() },
  },
  // Public records (by id/slug)
  {
    entityKind: 'record',
    entityId: 'recovery-plan-two-weeks',
    signalVector: { weights: withPrimary('operational_transformation', 0.4) },
  },
  {
    entityKind: 'record',
    entityId: 'executive-brief-scope-evaluation',
    signalVector: { weights: withPrimary('strategic_cognition', 0.4) },
  },
  {
    entityKind: 'record',
    entityId: 'procurement-governance-artifact',
    signalVector: { weights: withPrimary('institutional_leadership', 0.4) },
  },
  {
    entityKind: 'record',
    entityId: 'accessibility-compliance-evidence',
    signalVector: { weights: withPrimary('public_service_statesmanship', 0.4) },
  },
  {
    entityKind: 'record',
    entityId: 'security-disclosure-process',
    signalVector: { weights: withPrimary('public_service_statesmanship', 0.4) },
  },
  {
    entityKind: 'record',
    entityId: 'content-os-pgf-adoption',
    signalVector: { weights: withPrimary('systems_construction', 0.4) },
  },
  {
    entityKind: 'record',
    entityId: 'intelligence-layer-graph-record',
    signalVector: { weights: withPrimary('systems_construction', 0.4) },
  },
  {
    entityKind: 'record',
    entityId: 'case-study-evidence-bundle',
    signalVector: { weights: balancedVector() },
  },
  // Case studies (by id/slug)
  {
    entityKind: 'caseStudy',
    entityId: 'program-recovery-plan',
    signalVector: { weights: withPrimary('operational_transformation', 0.4) },
  },
  {
    entityKind: 'caseStudy',
    entityId: 'governance-operating-system',
    signalVector: { weights: withPrimary('systems_construction', 0.4) },
  },
  {
    entityKind: 'caseStudy',
    entityId: 'evidence-verification-policy',
    signalVector: { weights: withPrimary('public_service_statesmanship', 0.4) },
  },
  // Books (by id/slug)
  {
    entityKind: 'book',
    entityId: 'briefing-and-governance',
    signalVector: { weights: withPrimary('institutional_leadership', 0.4) },
  },
  {
    entityKind: 'book',
    entityId: 'policy-and-evidence',
    signalVector: { weights: withPrimary('strategic_cognition', 0.4) },
  },
  // Executive brief node (single page-level entity)
  {
    entityKind: 'briefNode',
    entityId: 'brief',
    signalVector: { weights: balancedVector() },
  },
  // Frameworks (doctrine) — add entries when content/frameworks/*.mdx exist
  {
    entityKind: 'framework',
    entityId: 'strategic-cognition-lens',
    signalVector: { weights: withPrimary('strategic_cognition', 0.4) },
  },
  {
    entityKind: 'framework',
    entityId: 'governance-stack-doctrine',
    signalVector: { weights: withPrimary('institutional_leadership', 0.4) },
  },
  {
    entityKind: 'framework',
    entityId: 'operational-transformation-model',
    signalVector: { weights: withPrimary('operational_transformation', 0.4) },
  },
];
