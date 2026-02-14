/**
 * Server slot: passes navItems and navLabel to MobileNavSheet (client).
 */
import { MobileNavSheet } from './MobileNavSheet';
import type { ServerShellNavItem } from './ServerShell';

export interface MobileNavSlotProps {
  navItems: ServerShellNavItem[];
  navLabel: string;
}

export function MobileNavSlot({ navItems, navLabel }: MobileNavSlotProps) {
  return <MobileNavSheet navItems={navItems} navLabel={navLabel} />;
}
