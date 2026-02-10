'use client';

/**
 * Client gate: renders children only when no consent choice has been made.
 * Used so that when ConsentActionsIsland calls acceptAll/rejectNonEssential,
 * context updates and this slot unmounts the banner without full page reload.
 */
import type { ReactNode } from 'react';
import { useConsentV2 } from './ConsentContextV2';

export interface ConsentBannerSlotProps {
  children: ReactNode;
}

export function ConsentBannerSlot({ children }: ConsentBannerSlotProps) {
  const { choiceMade } = useConsentV2();
  if (choiceMade) return null;
  return <>{children}</>;
}
