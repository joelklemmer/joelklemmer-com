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
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="section-shell">
            <h2 className="text-section-heading font-semibold">{title}</h2>
            {lede ? <p className="text-base text-muted mt-2">{lede}</p> : null}
          </div>
          {action ? (
            <Link
              href={action.href}
              className={`${focusRingClass} rounded-md border border-border px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent transition-colors motion-reduce:transition-none`}
            >
              {action.label}
            </Link>
          ) : null}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const content = (
              <div className="authority-card section-shell rounded-lg border border-border h-full flex flex-col">
                <div className="section-shell flex-1">
                  <h3 className="text-lg font-semibold text-text mb-2">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="text-sm text-muted leading-relaxed">
                      {item.description}
                    </p>
                  ) : null}
                </div>
                {item.meta ? (
                  <p className="text-xs text-muted mt-4 pt-4 border-t border-border">
                    {item.meta}
                  </p>
                ) : null}
              </div>
            );

            return item.href ? (
              <Link
                key={item.href}
                href={item.href}
                className={`${focusRingClass} block rounded-lg transition-transform motion-reduce:transition-none hover:scale-[1.02]`}
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
