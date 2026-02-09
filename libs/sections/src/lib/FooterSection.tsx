import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';

export interface FooterLinkItem {
  href: string;
  label: string;
}

export interface FooterSectionProps {
  label: string;
  links: FooterLinkItem[];
}

export function FooterSection({ label, links }: FooterSectionProps) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              prefetch={false}
              className={`${focusRingClass} rounded-sm px-1 py-0.5 hover:text-text transition-colors`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
