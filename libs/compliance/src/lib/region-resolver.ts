/**
 * Region policy resolver. Strict opt-in on uncertainty; never relax based on unknown region.
 */
export type RegionCode = 'eu' | 'uk' | 'gb' | 'eea' | 'us' | 'default';

export interface RegionPolicy {
  /** Require explicit consent before any non-essential processing. */
  requiresExplicitConsent: boolean;
  /** Region identifier used for policy. */
  region: RegionCode;
}

/**
 * Resolve region from geo headers or hints. Returns policy.
 * Default: strict opt-in (requiresExplicitConsent true) when region is uncertain.
 */
export function resolveRegionPolicy(geoHeader?: string | null): RegionPolicy {
  if (!geoHeader || typeof geoHeader !== 'string') {
    return { requiresExplicitConsent: true, region: 'default' };
  }
  const upper = geoHeader.toUpperCase();
  if (upper === 'EU' || upper === 'EEA' || upper === 'UK' || upper === 'GB') {
    return {
      requiresExplicitConsent: true,
      region: upper === 'UK' || upper === 'GB' ? 'uk' : 'eu',
    };
  }
  if (upper === 'US') {
    return { requiresExplicitConsent: true, region: 'us' };
  }
  return { requiresExplicitConsent: true, region: 'default' };
}

/**
 * Whether non-essential scripts/telemetry may load without explicit consent.
 * Always false: strict opt-in globally.
 */
export function mayLoadNonEssentialWithoutConsent(
  _policy?: RegionPolicy,
): boolean {
  return false;
}
