/**
 * Serializable DTO types for the Brief navigator. Used by server (BriefScreen) and client (BriefNavigator).
 * No zod or runtime validation here; validation happens server-side in content layer.
 */

export interface BriefNavigatorClaimCard {
  id: string;
  label: string;
  summary: string;
  category?: string;
  categoryId?: string;
  verificationStrength: number;
  lastVerified?: string;
  supportingLinks: Array<{ label: string; href: string }>;
  caseStudies: Array<{ slug: string; title: string }>;
  casestudiesBasePath: string;
  supportingRecordsLabel: string;
  supportingCaseStudiesLabel: string;
  verificationConnectionsLabel: string;
  lastVerifiedLabel: string;
  dominantSignalId?: string;
}

export interface BriefNavigatorLabels {
  viewGrid: string;
  viewGraph: string;
  viewModeLabel: string;
  filterCategoryLegend: string;
  filterStrengthLegend: string;
  categoryAll: string;
  strengthAll: string;
  strengthMinByCount: Record<number, string>;
  closePanel: string;
  viewInBrief: string;
  recordCountByCount: Record<number, string>;
  caseStudyCountByCount: Record<number, string>;
}

export interface BriefNavigatorProps {
  claimCards: BriefNavigatorClaimCard[];
  briefAnchorBase: string;
  categoryOptions: Array<{ id: string; label: string }>;
  labels: BriefNavigatorLabels;
}
