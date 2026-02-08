import type { ReactNode } from 'react';

export interface SectionVisualAnchorProps {
  /** Optional content (e.g. image, icon). Empty renders a token-aware focal zone. */
  children?: ReactNode;
  /** Optional className for layout overrides */
  className?: string;
}

/**
 * Optional visual zone for section authority presence. Token-aware composition
 * (graphite palette, border, shadow). Use in Doctrine, Brief, Books sections.
 */
export function SectionVisualAnchor({
  children,
  className = '',
}: SectionVisualAnchorProps) {
  return (
    <div
      className={`section-visual-anchor ${className}`.trim()}
      aria-hidden={!children}
    >
      {children}
    </div>
  );
}
