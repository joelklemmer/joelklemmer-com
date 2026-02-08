export const tokens = {
  colorBg: 'hsl(var(--color-bg))',
  colorText: 'hsl(var(--color-text))',
  colorAccent: 'hsl(var(--color-accent))',
  space4: 'var(--space-4)',
  textBase: 'var(--text-base)',
} as const;

/** UASIL: authority signal visual hooks (spacing, hierarchy, motion, depth). Use with data-dominant-signal. */
export const authoritySignalTokens = {
  spacingDensity: 'var(--authority-spacing-density, 1)',
  hierarchyEmphasis: 'var(--authority-hierarchy-emphasis, 1)',
  motionRestraint: 'var(--authority-motion-restraint, 0)',
  depthLayer: 'var(--authority-depth-layer, 0)',
} as const;
