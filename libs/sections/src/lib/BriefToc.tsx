/**
 * Brief page Table of Contents: sticky rail on desktop, Jump to disclosure on mobile.
 * Uses semantic nav and details/summary for mobile (no client JS).
 */
import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';

export interface BriefTocItem {
  id: string;
  label: string;
}

export interface BriefTocProps {
  items: BriefTocItem[];
  jumpToLabel: string;
}

function TocLinks({
  items,
  className = '',
  linkClassName = '',
}: {
  items: BriefTocItem[];
  className?: string;
  linkClassName?: string;
}) {
  return (
    <ul className={`flex flex-col gap-2 text-sm ${className}`.trim()}>
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`#${item.id}`}
            className={`${focusRingClass} block py-1 text-muted hover:text-accent ${linkClassName}`.trim()}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Mobile: Jump to disclosure (use inside main content area) */
export function BriefTocMobile({ items, jumpToLabel }: BriefTocProps) {
  return (
    <details
      className="brief-toc-mobile lg:hidden [&>summary::-webkit-details-marker]:hidden"
      data-brief-toc
    >
      <summary
        className={`${focusRingClass} cursor-pointer list-none py-3 text-sm font-medium text-text [&::-webkit-details-marker]:hidden`}
      >
        {jumpToLabel}
      </summary>
      <nav className="pb-4 pt-2" aria-label={jumpToLabel}>
        <TocLinks items={items} />
      </nav>
    </details>
  );
}

/** Compact inline TOC below metrics: desktop visible, quiet anchor list. */
export function BriefTocCompact({ items, jumpToLabel }: BriefTocProps) {
  return (
    <nav className="hidden lg:block pt-6" aria-label={jumpToLabel}>
      <p className="text-xs uppercase tracking-wider text-muted mb-3">
        {jumpToLabel}
      </p>
      <TocLinks items={items} className="gap-1.5" linkClassName="text-xs" />
    </nav>
  );
}

/** Desktop: sticky rail (use as grid sibling of main) */
export function BriefTocRail({ items, jumpToLabel }: BriefTocProps) {
  return (
    <aside className="hidden lg:block pt-6 ps-2" aria-label={jumpToLabel}>
      <nav className="sticky top-24">
        <TocLinks items={items} className="min-w-[12rem]" />
      </nav>
    </aside>
  );
}

/** Combines both for simple usage */
export function BriefToc({ items, jumpToLabel }: BriefTocProps) {
  return (
    <>
      <BriefTocMobile items={items} jumpToLabel={jumpToLabel} />
      <BriefTocRail items={items} jumpToLabel={jumpToLabel} />
    </>
  );
}
