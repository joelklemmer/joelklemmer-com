import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Box } from './Box';

export interface AuthoritySurfaceProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
  /** Dominant authority signal id (UASIL). Sets data-dominant-signal for token-driven styling. */
  dominantSignalId?: string;
  /** Evaluator mode context. Sets data-evaluator-mode. */
  evaluatorMode?: string;
  /** Density view state. Sets data-density-mode. Restrained; no visible labels. */
  densityMode?: 'on' | 'off';
}

/**
 * Signal-driven surface: sets data attributes for Visual Authority tokens.
 * No visible labels; no dashboard-style color coding. Restraint only.
 */
export function AuthoritySurface({
  children,
  dominantSignalId,
  evaluatorMode,
  densityMode,
  className,
  ...rest
}: AuthoritySurfaceProps) {
  const dataProps: Record<string, string | undefined> = {};
  if (dominantSignalId) dataProps['data-dominant-signal'] = dominantSignalId;
  if (evaluatorMode) dataProps['data-evaluator-mode'] = evaluatorMode;
  if (densityMode) dataProps['data-density-mode'] = densityMode;

  return (
    <Box className={className} {...dataProps} {...rest}>
      {children}
    </Box>
  );
}
