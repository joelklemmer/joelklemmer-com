import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface CardItem {
  title: string;
  description?: string;
  meta?: string;
  href?: string;
}

export interface CardGridSectionProps {
  title: string;
  lede?: string;
  items: CardItem[];
  action?: {
    label: string;
    href: string;
  };
}

export function CardGridSection({
  title,
  lede,
  items,
  action,
}: CardGridSectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="section-shell">
            <h2 className="text-title font-semibold">{title}</h2>
            {lede ? <p className="text-base text-muted">{lede}</p> : null}
          </div>
          {action ? (
            <Link
              href={action.href}
              className={`${focusRingClass} rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent`}
            >
              {action.label}
            </Link>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const content = (
              <div className="section-shell rounded-card border border-border bg-surface p-4">
                <div className="section-shell">
                  <h3 className="text-lg font-semibold text-text">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="text-sm text-muted">{item.description}</p>
                  ) : null}
                </div>
                {item.meta ? (
                  <p className="text-xs text-muted">{item.meta}</p>
                ) : null}
              </div>
            );

            return item.href ? (
              <Link
                key={item.href}
                href={item.href}
                className={`${focusRingClass} block rounded-card`}
              >
                {content}
              </Link>
            ) : (
              <div key={item.title}>{content}</div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
