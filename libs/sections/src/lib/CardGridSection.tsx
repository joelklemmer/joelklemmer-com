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
  id?: string;
  title: string;
  lede?: string;
  items: CardItem[];
  action?: {
    label: string;
    href: string;
  };
}

export function CardGridSection({
  id,
  title,
  lede,
  items,
  action,
}: CardGridSectionProps) {
  return (
    <section id={id} className="section-shell">
      <Container className="section-shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="section-shell">
            <h2 className="text-section-heading font-semibold">{title}</h2>
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
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => {
            const content = (
              <div className="authority-card section-shell rounded-lg border border-border/60 bg-surface p-6 hover:border-accent/40 transition-colors motion-reduce:transition-none">
                <div className="section-shell">
                  <h3 className="text-xl font-semibold text-text mb-2">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="text-base text-muted leading-relaxed">{item.description}</p>
                  ) : null}
                </div>
                {item.meta ? (
                  <p className="text-xs text-muted mt-3 pt-3 border-t border-border/40">{item.meta}</p>
                ) : null}
              </div>
            );

            return item.href ? (
              <Link
                key={item.href}
                href={item.href}
                className={`${focusRingClass} block rounded-lg hover:scale-[1.01] transition-transform motion-reduce:transition-none`}
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
