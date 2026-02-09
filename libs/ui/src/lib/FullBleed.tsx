import type { ReactNode } from 'react';
import { Box } from './Box';

export interface FullBleedProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Full-width wrapper for section content. Use so section backgrounds span
 * viewport width while inner content stays in a lane (Container).
 * See docs/authority/responsive-contract.md.
 */
export function FullBleed({ children, className = '' }: FullBleedProps) {
  return (
    <Box className={`full-bleed w-full ${className}`.trim()}>{children}</Box>
  );
}
