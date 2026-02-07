import type { ReactNode } from 'react';
import { Box } from './Box';

export interface ContainerProps {
  children?: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <Box className={`mx-auto w-full max-w-4xl px-6 ${className}`.trim()}>
      {children}
    </Box>
  );
}
