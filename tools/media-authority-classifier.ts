/**
 * Media Authority Classifier (MAC): deterministic classification for manifest entries.
 * Assigns authorityTier, personaSignal, environmentSignal, formalityLevel, visualTone, descriptorDisplayLabel.
 * Used by reclassify, queue builder, and validators.
 * Run as module only; no CLI.
 */
export type AuthorityTier = 'A' | 'B' | 'C';
export type PersonaSignal =
  | 'executive'
  | 'statesman'
  | 'author'
  | 'speaker'
  | 'institutional';
export type EnvironmentSignal =
  | 'studio'
  | 'podium'
  | 'office'
  | 'literary'
  | 'field'
  | 'architectural';
export type FormalityLevel = 'high' | 'elevated' | 'moderate';
export type VisualTone =
  | 'commanding'
  | 'approachable'
  | 'scholarly'
  | 'decisive'
  | 'strategic';

const TIER_A_VISIBLE = new Set([
  'executive-studio',
  'formal-board',
  'institutional-identity',
  'statesman-portrait',
  'policy-profile',
  'press-headshot',
  'leadership-profile',
  'speaking-address',
  'author-environment',
]);
const TIER_A_OTHER = new Set([
  'startup-founder',
  'city-vogue',
  'luxury-hotel',
  'fine-dining',
]);
const TIER_B = new Set([
  'outdoor-adventure',
  'winter',
  'luxury',
  'hot-air-balloon',
]);
const TIER_C = new Set([
  'cozy-home',
  'easter',
  'glamour-photos',
  'glamour',
  'modeling',
  'luxury-cruise',
  'casual',
  'party',
  'social',
]);

const DESCRIPTOR_DISPLAY_LABELS: Record<string, string> = {
  'executive-studio': 'Executive studio',
  'formal-board': 'Formal board',
  'institutional-identity': 'Institutional identity',
  'statesman-portrait': 'Statesman portrait',
  'policy-profile': 'Policy profile',
  'press-headshot': 'Press headshot',
  'leadership-profile': 'Leadership profile',
  'speaking-address': 'Speaking address',
  'author-environment': 'Author environment',
  'keynote-podium': 'Keynote address',
  'bookstore-stack': 'Author portrait',
  'startup-founder': 'Startup founder',
  'city-vogue': 'City',
  'luxury-hotel': 'Luxury hotel',
  'fine-dining': 'Fine dining',
  'outdoor-adventure': 'Outdoor',
  winter: 'Winter',
  luxury: 'Luxury',
  'hot-air-balloon': 'Hot air balloon',
  casual: 'Casual',
  party: 'Party',
  social: 'Social',
};

export interface MacResult {
  authorityTier: AuthorityTier;
  personaSignal: PersonaSignal;
  environmentSignal: EnvironmentSignal;
  formalityLevel: FormalityLevel;
  visualTone: VisualTone;
  descriptorDisplayLabel: string;
}

export function getAuthorityTier(descriptor: string): AuthorityTier {
  if (TIER_A_VISIBLE.has(descriptor) || TIER_A_OTHER.has(descriptor))
    return 'A';
  if (TIER_B.has(descriptor)) return 'B';
  return 'C';
}

export function getPersonaSignal(descriptor: string): PersonaSignal {
  switch (descriptor) {
    case 'executive-studio':
    case 'formal-board':
    case 'leadership-profile':
      return 'executive';
    case 'statesman-portrait':
    case 'policy-profile':
      return 'statesman';
    case 'author-environment':
      return 'author';
    case 'speaking-address':
      return 'speaker';
    case 'institutional-identity':
    case 'press-headshot':
      return 'institutional';
    default:
      return 'executive';
  }
}

export function getEnvironmentSignal(descriptor: string): EnvironmentSignal {
  if (descriptor === 'speaking-address') return 'podium';
  if (descriptor === 'author-environment') return 'literary';
  if (
    [
      'executive-studio',
      'formal-board',
      'institutional-identity',
      'press-headshot',
      'leadership-profile',
      'statesman-portrait',
      'policy-profile',
    ].includes(descriptor)
  )
    return 'studio';
  return 'studio';
}

export function getFormalityLevel(descriptor: string): FormalityLevel {
  if (
    ['formal-board', 'press-headshot', 'institutional-identity'].includes(
      descriptor,
    )
  )
    return 'high';
  if (
    [
      'executive-studio',
      'statesman-portrait',
      'leadership-profile',
      'policy-profile',
    ].includes(descriptor)
  )
    return 'elevated';
  return 'moderate';
}

export function getVisualTone(descriptor: string): VisualTone {
  switch (descriptor) {
    case 'formal-board':
      return 'commanding';
    case 'author-environment':
      return 'approachable';
    case 'statesman-portrait':
    case 'policy-profile':
      return 'scholarly';
    case 'leadership-profile':
      return 'strategic';
    case 'executive-studio':
    case 'press-headshot':
      return 'decisive';
    default:
      return 'commanding';
  }
}

export function getDescriptorDisplayLabel(descriptor: string): string {
  return (
    DESCRIPTOR_DISPLAY_LABELS[descriptor] ??
    descriptor.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/** Deterministic MAC: full classification for a descriptor. */
export function classifyByDescriptor(descriptor: string): MacResult {
  return {
    authorityTier: getAuthorityTier(descriptor),
    personaSignal: getPersonaSignal(descriptor),
    environmentSignal: getEnvironmentSignal(descriptor),
    formalityLevel: getFormalityLevel(descriptor),
    visualTone: getVisualTone(descriptor),
    descriptorDisplayLabel: getDescriptorDisplayLabel(descriptor),
  };
}
