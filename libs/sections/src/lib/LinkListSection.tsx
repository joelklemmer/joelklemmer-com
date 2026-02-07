import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface LinkListItem {
  label: string;
  href: string;
}

export interface LinkListSectionProps {
  title: string;
  items: LinkListItem[];
  /** Shown when items is empty */
  emptyMessage?: string;
}

export function LinkListSection({
  title,
  items,
  emptyMessage,
}: LinkListSectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        <h2 className="text-title font-semibold">{title}</h2>
        {items.length > 0 ? (
          <ul className="grid gap-2 text-base text-muted">
            {items.map((item) => (
            <li key={item.href} className="flex gap-2">
              <span aria-hidden="true">•</span>
              <Link
                href={item.href}
                className={`${focusRingClass} underline underline-offset-4 hover:text-accent`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        ) : emptyMessage ? (
          <p className="text-base text-muted">{emptyMessage}</p>
        ) : null}
      </Container>
    </section>
  );
}
