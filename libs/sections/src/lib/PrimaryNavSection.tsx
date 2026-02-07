import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';

export interface PrimaryNavItem {
  href: string;
  label: string;
}

export interface PrimaryNavSectionProps {
  items: PrimaryNavItem[];
}

export function PrimaryNavSection({ items }: PrimaryNavSectionProps) {
  return (
    <ul className="flex flex-wrap items-center gap-4 text-sm text-muted">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={`${focusRingClass} rounded-sm px-1 py-0.5 hover:text-text`}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
