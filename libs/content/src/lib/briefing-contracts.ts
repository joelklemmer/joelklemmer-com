/**
 * Intelligence Layer Surface — Briefing-mode contracts.
 * Types and interfaces for future intelligence providers; deterministic
 * fallback behaviors that are useful today. No LLM calls, no mock AI.
 *
 * @see docs/intelligence-layer/readiness-doctrine.md
 */

import type { ClaimCategoryId } from './claims';

// ——— Claim / proof map (structured evidence) ———

/** Single proof link for display (record or artifact supporting a claim). */
export interface BriefingProofLink {
  id: string;
  label: string;
  href: string;
  /** YYYY-MM-DD when available */
  date?: string;
}

/** One claim with its supporting proofs and optional case study refs. */
export interface ClaimProofEntry {
  claimId: string;
  claimLabel: string;
  claimSummary: string;
  categoryId: ClaimCategoryId;
  proofs: BriefingProofLink[];
  caseStudyCount: number;
  /** Max date among proof dates (last verified). */
  lastVerified?: string;
}

/** Structured claim→proof map for briefing context. Deterministic from content. */
export interface ClaimProofMap {
  entries: ClaimProofEntry[];
  /** Total distinct proofs across all claims. */
  totalProofCount: number;
}

// ——— "What matters" compression (deterministic summary) ———

/** Compressed highlight: one line for briefing-at-a-glance. */
export interface WhatMattersItem {
  id: string;
  /** Short label (e.g. claim label or category summary). */
  label: string;
  /** One-line summary. */
  summary: string;
  kind: 'claim' | 'category';
  /** For claim items: claim id. For category: category id. */
  refId: string;
  /** Verification strength (proof count) for ordering. */
  verificationStrength: number;
}

/** Deterministic "what matters" summary: top claims/categories by verification. */
export interface WhatMattersSummary {
  items: WhatMattersItem[];
  /** Generated at build/request time; no AI. */
  source: 'deterministic';
}

// ——— Full briefing context (contract for consumers) ———

/** Contextual panel content: scope and read path. */
export interface BriefingPanelContext {
  /** 2–4 sentence scope (identity + method + verification). */
  scopeSummary: string;
  /** Short read-path labels with hrefs. */
  readPathLinks: Array<{ label: string; href: string }>;
}

/** Full briefing context: panels + claim/proof map + what matters. All deterministic. */
export interface BriefingContext {
  panel: BriefingPanelContext;
  claimProofMap: ClaimProofMap;
  whatMatters: WhatMattersSummary;
  /** Locale for which this context was built. */
  locale: string;
}

// ——— Future intelligence provider (extension point; no implementation here) ———

/**
 * Contract for a future intelligence provider (e.g. LLM-backed briefing).
 * The app does NOT implement or call this today. Surfaces are built from
 * deterministic fallbacks only.
 */
export interface IntelligenceProvider {
  /** Provider identifier (e.g. 'deterministic' | 'future-llm'). */
  readonly id: string;
  /** Whether this provider is available in the current environment. */
  isAvailable(): boolean | Promise<boolean>;
  /**
   * Optional: augment or replace what-matters summary.
   * If not implemented or returns null, consumer uses deterministic fallback.
   */
  getWhatMattersSummary?(context: {
    locale: string;
    claimProofMap: ClaimProofMap;
  }): Promise<WhatMattersSummary | null>;
  /**
   * Optional: augment panel context (e.g. personalized read path).
   * If not implemented or returns null, consumer uses deterministic fallback.
   */
  getPanelContext?(context: {
    locale: string;
  }): Promise<BriefingPanelContext | null>;
}

/** Deterministic provider id used by fallback builders. */
export const DETERMINISTIC_BRIEFING_PROVIDER_ID = 'deterministic';

// ——— Deterministic fallback builders ———

/** Input for building ClaimProofMap from content. */
export interface ClaimProofMapInputItem {
  claimId: string;
  claimLabel: string;
  claimSummary: string;
  categoryId: ClaimCategoryId;
  proofLinks: BriefingProofLink[];
  caseStudyCount: number;
  lastVerified?: string;
}

/**
 * Build a structured claim→proof map from precomputed claim cards.
 * Deterministic; no I/O or AI.
 */
export function buildClaimProofMap(
  items: ClaimProofMapInputItem[],
): ClaimProofMap {
  const proofIds = new Set<string>();
  const entries: ClaimProofEntry[] = items.map((item) => {
    item.proofLinks.forEach((p) => proofIds.add(p.id));
    return {
      claimId: item.claimId,
      claimLabel: item.claimLabel,
      claimSummary: item.claimSummary,
      categoryId: item.categoryId,
      proofs: item.proofLinks,
      caseStudyCount: item.caseStudyCount,
      lastVerified: item.lastVerified,
    };
  });
  return {
    entries,
    totalProofCount: proofIds.size,
  };
}

/**
 * Build "what matters" summary from claim/proof entries.
 * Deterministic: top N by verification strength, then by category diversity.
 */
export function buildWhatMattersSummary(
  claimProofEntries: ClaimProofEntry[],
  options?: { maxItems?: number },
): WhatMattersSummary {
  const maxItems = options?.maxItems ?? 6;
  const byStrength = [...claimProofEntries].sort(
    (a, b) =>
      b.proofs.length - a.proofs.length ||
      (b.caseStudyCount ?? 0) - (a.caseStudyCount ?? 0),
  );
  const items: WhatMattersItem[] = byStrength.slice(0, maxItems).map((e) => ({
    id: e.claimId,
    label: e.claimLabel,
    summary: e.claimSummary,
    kind: 'claim',
    refId: e.claimId,
    verificationStrength: e.proofs.length + e.caseStudyCount,
  }));
  return { items, source: 'deterministic' };
}

/**
 * Build minimal panel context (scope + read path).
 * Caller supplies translated strings and links; this is a pure shape builder.
 */
export function buildBriefingPanelContext(
  scopeSummary: string,
  readPathLinks: Array<{ label: string; href: string }>,
): BriefingPanelContext {
  return { scopeSummary, readPathLinks };
}

/**
 * Build full BriefingContext from precomputed parts.
 * Use after building claimProofMap and whatMatters from content.
 */
export function buildBriefingContext(
  locale: string,
  panel: BriefingPanelContext,
  claimProofMap: ClaimProofMap,
  whatMattersOptions?: { maxItems?: number },
): BriefingContext {
  const whatMatters = buildWhatMattersSummary(
    claimProofMap.entries,
    whatMattersOptions,
  );
  return {
    panel,
    claimProofMap,
    whatMatters,
    locale,
  };
}
