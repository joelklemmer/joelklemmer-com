/**
 * Contact pathways registry: governed configuration for controlled intake.
 * Used by the /contact page only. Validated at build (content-validate + i18n-validate).
 */
export interface ContactPathwayEntry {
  id: string;
  labelKey: string;
  descriptionKey: string;
  /** i18n key for subject line template (no apostrophes in values). */
  subjectTemplateKey: string;
  /** Field keys to request in body, e.g. name, organization, role, reason, links. */
  recommendedFields: string[];
  ctaKey: string;
  priorityOrder: number;
}

export const CONTACT_PATHWAY_IDS = [
  'recruiting',
  'board',
  'media',
  'publicRecord',
  'general',
] as const;

export type ContactPathwayId = (typeof CONTACT_PATHWAY_IDS)[number];

export const contactPathways: ContactPathwayEntry[] = [
  {
    id: 'recruiting',
    labelKey: 'pathways.recruiting.label',
    descriptionKey: 'pathways.recruiting.description',
    subjectTemplateKey: 'pathways.recruiting.subjectTemplate',
    recommendedFields: ['name', 'organization', 'role', 'reason', 'links'],
    ctaKey: 'pathways.recruiting.cta',
    priorityOrder: 0,
  },
  {
    id: 'board',
    labelKey: 'pathways.board.label',
    descriptionKey: 'pathways.board.description',
    subjectTemplateKey: 'pathways.board.subjectTemplate',
    recommendedFields: ['name', 'organization', 'role', 'reason', 'links'],
    ctaKey: 'pathways.board.cta',
    priorityOrder: 1,
  },
  {
    id: 'media',
    labelKey: 'pathways.media.label',
    descriptionKey: 'pathways.media.description',
    subjectTemplateKey: 'pathways.media.subjectTemplate',
    recommendedFields: ['name', 'outlet', 'topic', 'deadline'],
    ctaKey: 'pathways.media.cta',
    priorityOrder: 2,
  },
  {
    id: 'publicRecord',
    labelKey: 'pathways.publicRecord.label',
    descriptionKey: 'pathways.publicRecord.description',
    subjectTemplateKey: 'pathways.publicRecord.subjectTemplate',
    recommendedFields: ['name', 'recordUrl', 'proposedCorrection', 'evidence'],
    ctaKey: 'pathways.publicRecord.cta',
    priorityOrder: 3,
  },
  {
    id: 'general',
    labelKey: 'pathways.general.label',
    descriptionKey: 'pathways.general.description',
    subjectTemplateKey: 'pathways.general.subjectTemplate',
    recommendedFields: ['name', 'topic', 'message'],
    ctaKey: 'pathways.general.cta',
    priorityOrder: 4,
  },
];

/** Sorted by priorityOrder. */
export function getContactPathways(): ContactPathwayEntry[] {
  return [...contactPathways].sort((a, b) => a.priorityOrder - b.priorityOrder);
}
