import type { ReactNode } from 'react';
import { Box } from './Box';

export interface ContainerProps {
  children?: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <Box className={`wrapper ${className}`.trim()}>
      <Box className={`container ${className}`.trim()}>{children}</Box>
    </Box>
  );
}
