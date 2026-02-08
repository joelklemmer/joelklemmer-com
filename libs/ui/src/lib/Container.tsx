import type { ReactNode } from 'react';
import { Box } from './Box';

export interface ContainerProps {
  children?: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <Box
      className={`mx-auto w-full max-w-container px-6 sm:px-8 ${className}`.trim()}
    >
      {children}
    </Box>
  );
}
