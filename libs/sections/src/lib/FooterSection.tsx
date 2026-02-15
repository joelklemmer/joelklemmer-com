import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';

export interface FooterLinkItem {
  href: string;
  label: string;
}

export interface FooterGroup {
  header: string;
  links: FooterLinkItem[];
}

export interface FooterSectionProps {
  /** A11y label for nav landmark */
  label: string;
  /** Flat links (legacy). Ignored when groups provided. */
  links?: FooterLinkItem[];
  /** Grouped links (Figma Make). When provided, renders three-column layout. */
  groups?: FooterGroup[];
  /** Copyright string for bottom bar (e.g. © 2026 Joel R. Klemmer). */
  copyright?: string;
}

export function FooterSection({
  label,
  links,
  groups,
  copyright,
}: FooterSectionProps) {
  const useGroups = groups != null && groups.length > 0;

  return (
    <div className="footer-figma-layout">
      {useGroups ? (
        <nav aria-label={label} className="footer-groups">
          {groups.map((group) => (
            <div key={group.header} className="footer-group">
              <h3 className="footer-group-header">{group.header}</h3>
              <ul className="footer-group-list">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className={`${focusRingClass} footer-link rounded-none py-0.5 hover:text-text transition-colors`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      ) : (
        <nav aria-label={label}>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            {(links ?? []).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className={`${focusRingClass} rounded-none px-1 py-0.5 hover:text-text transition-colors`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {copyright != null && (
        <div className="footer-bottom-bar">
          <span className="footer-copyright text-muted text-sm">
            {copyright}
          </span>
        </div>
      )}
    </div>
  );
}
