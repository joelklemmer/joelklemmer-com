import type { ReactNode } from 'react';
import { Box } from './Box';

export interface PageFrameProps {
  children?: ReactNode;
  /** When true, wraps content in a subtle "content stage" background (reduces thin-column float). */
  contentStage?: boolean;
  className?: string;
}

/**
 * Page Frame: consistent max-width lane, section spacing, optional content stage.
 * Use as the main content wrapper so Home, Brief, Case Studies, Public Record, Media
 * share the same composition and reading rhythm. Token-driven; no monolithic CSS.
 * When contentStage=true, stage styles merge into page-frame (one wrapper, no redundant shell).
 */
export function PageFrame({
  children,
  contentStage = true,
  className = '',
}: PageFrameProps) {
  const frameClass =
    'page-frame' +
    (contentStage ? ' page-frame-stage' : '') +
    (className ? ` ${className}`.trim() : '');
  return <Box className={frameClass}>{children}</Box>;
}
