/** Claim category enum (max 6). Evaluator-grade rubric; enforced at build. */
export const CLAIM_CATEGORIES = [
  'operational_delivery',
  'risk_recovery',
  'stakeholder_alignment',
  'program_governance',
  'evidence_verification',
  'delivery_capability',
] as const;

export type ClaimCategoryId = (typeof CLAIM_CATEGORIES)[number];

const CLAIM_CATEGORY_SET = new Set<string>(CLAIM_CATEGORIES);

export interface ClaimRegistryEntry {
  id: string;
  labelKey: string;
  /** next-intl key for 1-line summary (brief namespace) */
  summaryKey: string;
  recordIds: string[];
  /** Category from CLAIM_CATEGORIES; i18n key is claims.categories.<category> */
  category: ClaimCategoryId;
  /** Confidence tier for verification strength display */
  confidenceTier?: 'high' | 'medium' | 'standard';
  featured?: boolean;
  order?: number;
}

export const claimRegistry: ClaimRegistryEntry[] = [
  {
    id: 'recovery-plan-speed',
    labelKey: 'claims.items.recoveryPlan.label',
    summaryKey: 'claims.items.recoveryPlan.summary',
    recordIds: ['recovery-plan-two-weeks'],
    category: 'operational_delivery',
    confidenceTier: 'high',
    featured: true,
    order: 0,
  },
  {
    id: 'executive-brief-evaluation',
    labelKey: 'claims.items.executiveBriefEvaluation.label',
    summaryKey: 'claims.items.executiveBriefEvaluation.summary',
    recordIds: ['executive-brief-scope-evaluation'],
    category: 'program_governance',
    confidenceTier: 'high',
    featured: true,
    order: 1,
  },
  {
    id: 'procurement-governance',
    labelKey: 'claims.items.procurementGovernance.label',
    summaryKey: 'claims.items.procurementGovernance.summary',
    recordIds: ['procurement-governance-artifact'],
    category: 'program_governance',
    confidenceTier: 'high',
    featured: true,
    order: 2,
  },
  {
    id: 'accessibility-compliance',
    labelKey: 'claims.items.accessibilityCompliance.label',
    summaryKey: 'claims.items.accessibilityCompliance.summary',
    recordIds: ['accessibility-compliance-evidence'],
    category: 'evidence_verification',
    confidenceTier: 'high',
    featured: true,
    order: 3,
  },
  {
    id: 'security-disclosure',
    labelKey: 'claims.items.securityDisclosure.label',
    summaryKey: 'claims.items.securityDisclosure.summary',
    recordIds: ['security-disclosure-process'],
    category: 'evidence_verification',
    confidenceTier: 'high',
    featured: true,
    order: 4,
  },
  {
    id: 'content-os-pgf',
    labelKey: 'claims.items.contentOsPgf.label',
    summaryKey: 'claims.items.contentOsPgf.summary',
    recordIds: ['content-os-pgf-adoption'],
    category: 'program_governance',
    confidenceTier: 'high',
    featured: true,
    order: 5,
  },
  {
    id: 'intelligence-graph',
    labelKey: 'claims.items.intelligenceGraph.label',
    summaryKey: 'claims.items.intelligenceGraph.summary',
    recordIds: ['intelligence-layer-graph-record'],
    category: 'evidence_verification',
    confidenceTier: 'high',
    featured: true,
    order: 6,
  },
  {
    id: 'case-study-evidence',
    labelKey: 'claims.items.caseStudyEvidence.label',
    summaryKey: 'claims.items.caseStudyEvidence.summary',
    recordIds: ['case-study-evidence-bundle'],
    category: 'delivery_capability',
    confidenceTier: 'high',
    featured: true,
    order: 7,
  },
  {
    id: 'delivery-governance',
    labelKey: 'claims.items.deliveryGovernance.label',
    summaryKey: 'claims.items.deliveryGovernance.summary',
    recordIds: ['recovery-plan-two-weeks', 'procurement-governance-artifact'],
    category: 'delivery_capability',
    confidenceTier: 'high',
    featured: true,
    order: 8,
  },
  {
    id: 'policy-verification',
    labelKey: 'claims.items.policyVerification.label',
    summaryKey: 'claims.items.policyVerification.summary',
    recordIds: [
      'accessibility-compliance-evidence',
      'security-disclosure-process',
    ],
    category: 'evidence_verification',
    confidenceTier: 'high',
    featured: false,
    order: 9,
  },
];

const MAX_CLAIMS = 12;
const MAX_FEATURED = 9;

export function getClaimsSupportingRecord(
  recordId: string,
): ClaimRegistryEntry[] {
  return claimRegistry.filter((claim) => claim.recordIds.includes(recordId));
}

/** Featured claims for default Brief view (top set, max 9). Sorted by order then by id. */
export function getFeaturedClaims(): ClaimRegistryEntry[] {
  const featured = claimRegistry
    .filter((c) => c.featured !== false)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  return featured.slice(0, MAX_FEATURED);
}

/** All claims sorted by order then id. */
export function getAllClaims(): ClaimRegistryEntry[] {
  return [...claimRegistry].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/**
 * Derive last verified date from linked Public Record entry dates (max date).
 * Returns YYYY-MM-DD or undefined if no dates available.
 */
export function getLastVerifiedFromRecordDates(
  recordIds: string[],
  recordIdToDate: Map<string, string>,
): string | undefined {
  const dates = recordIds
    .map((id) => recordIdToDate.get(id))
    .filter(
      (d): d is string =>
        typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d),
    );
  if (dates.length === 0) return undefined;
  return dates.sort().reverse()[0];
}

/**
 * Build-time validation: recordIds exist, category in enum, counts within limits.
 * Call from tools/validate-content.ts with publicRecordIdSet.
 */
export function validateClaimRegistry(publicRecordIdSet: Set<string>): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const errors: string[] = [];

  if (claimRegistry.length > MAX_CLAIMS) {
    const msg = `Claims registry: total must be <= ${MAX_CLAIMS}, got ${claimRegistry.length}`;
    if (isProduction) {
      errors.push(msg);
    } else {
      console.warn(`[dev] ${msg}`);
    }
  }

  const featuredCount = claimRegistry.filter(
    (c) => c.featured !== false,
  ).length;
  if (featuredCount > MAX_FEATURED) {
    const msg = `Claims registry: featured must be <= ${MAX_FEATURED}, got ${featuredCount}`;
    if (isProduction) {
      errors.push(msg);
    } else {
      console.warn(`[dev] ${msg}`);
    }
  }

  if (CLAIM_CATEGORIES.length > 6) {
    errors.push(
      `Claims registry: CLAIM_CATEGORIES must be <= 6, got ${CLAIM_CATEGORIES.length}`,
    );
  }

  for (const claim of claimRegistry) {
    if (!CLAIM_CATEGORY_SET.has(claim.category)) {
      errors.push(
        `Claim ${claim.id}: category "${claim.category}" must be one of [${CLAIM_CATEGORIES.join(', ')}]`,
      );
    }
    if (!claim.recordIds.length) {
      errors.push(`Claim ${claim.id} must have at least one recordId`);
    }
    for (const recordId of claim.recordIds) {
      if (!publicRecordIdSet.has(recordId)) {
        errors.push(
          `Claim ${claim.id} references missing public record id: ${recordId}`,
        );
      }
    }
  }

  if (errors.length) {
    throw new Error(`Claims registry validation failed:\n${errors.join('\n')}`);
  }
}
