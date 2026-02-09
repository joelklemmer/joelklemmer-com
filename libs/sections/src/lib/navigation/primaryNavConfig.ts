/**
 * Primary navigation cognitive hierarchy config.
 * Order and rank express: Brief hub primacy, proof-forward routing, institutional pathways.
 * Used by locale layout to build nav items; no duplicate nav definition.
 */

/** Perceptual rank for executive scan: primary = hub, secondary = verification, tertiary = institutional. */
export type NavRank = 'primary' | 'secondary' | 'tertiary';

export interface PrimaryNavEntry {
  /** Path segment (empty = home). href becomes `/${locale}` or `/${locale}/${path}` */
  path: string;
  /** i18n key under nav namespace (e.g. nav('brief')). */
  labelKey: string;
  /** Hierarchy weight for typography/spacing; omit for identity (home). */
  rank?: NavRank;
}

/**
 * Canonical order and rank for primary nav. Aligns with five authority signals structurally:
 * - Brief = hub (primary); Work + Proof = verification rails (secondary);
 * - Writing + Contact = institutional (tertiary).
 */
export const PRIMARY_NAV_ENTRIES: PrimaryNavEntry[] = [
  { path: '', labelKey: 'home' },
  { path: 'brief', labelKey: 'brief', rank: 'primary' },
  { path: 'work', labelKey: 'work', rank: 'secondary' },
  { path: 'writing', labelKey: 'writing', rank: 'tertiary' },
  { path: 'proof', labelKey: 'proof', rank: 'secondary' },
  { path: 'contact', labelKey: 'contact', rank: 'tertiary' },
];
