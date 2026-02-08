import type { ReactNode } from 'react';
import { Box } from './Box';

export interface ContainerProps {
  children?: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <Box
      className={`mx-auto w-full max-w-container ps-container-x-start pe-container-x sm:ps-container-x-wide sm:pe-container-x-wide ${className}`.trim()}
    >
      {children}
    </Box>
  );
}
