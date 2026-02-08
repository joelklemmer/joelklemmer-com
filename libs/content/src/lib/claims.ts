export interface ClaimRegistryEntry {
  id: string;
  labelKey: string;
  /** next-intl key for 1-line summary (brief namespace) */
  summaryKey: string;
  recordIds: string[];
  /** next-intl key for category label (brief namespace) */
  categoryKey?: string;
  /** Confidence tier for verification strength display */
  confidenceTier?: 'high' | 'medium' | 'standard';
  /** Last verification date (YYYY-MM-DD) */
  lastVerified?: string;
  featured?: boolean;
  order?: number;
}

export const claimRegistry: ClaimRegistryEntry[] = [
  {
    id: 'recovery-plan-speed',
    labelKey: 'claims.items.recoveryPlan.label',
    summaryKey: 'claims.items.recoveryPlan.summary',
    recordIds: ['recovery-plan-two-weeks'],
    categoryKey: 'claims.categories.operational',
    confidenceTier: 'high',
    lastVerified: '2026-01-18',
    featured: true,
    order: 0,
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
 * Build-time validation: recordIds exist, counts within limits.
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

  for (const claim of claimRegistry) {
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
