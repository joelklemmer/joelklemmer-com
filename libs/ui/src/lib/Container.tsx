import type { ReactNode } from 'react';
import { Box } from './Box';

/** Lane variant: readable (42rem), wide (56rem), full (no max-width). See docs/authority/responsive-contract.md */
export type ContainerVariant = 'readable' | 'wide' | 'full';

export interface ContainerProps {
  children?: ReactNode;
  className?: string;
  /** Lane variant; default 'wide' for backward compatibility. */
  variant?: ContainerVariant;
}

const variantMaxWidthClass: Record<ContainerVariant, string> = {
  readable: 'max-w-readable',
  wide: 'max-w-container',
  full: 'max-w-none',
};

export function Container({
  children,
  className = '',
  variant = 'wide',
}: ContainerProps) {
  const maxWidthClass = variantMaxWidthClass[variant];
  return (
    <Box
      className={`mx-auto w-full ${maxWidthClass} ps-container-x-start pe-container-x sm:ps-container-x-wide sm:pe-container-x-wide ${className}`.trim()}
    >
      {children}
    </Box>
  );
}
