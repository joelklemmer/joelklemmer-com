import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface VerificationRailItem {
  title: string;
  description?: string;
  href: string;
}

export interface VerificationRailsSectionProps {
  id?: string;
  title: string;
  items: VerificationRailItem[];
}

export function VerificationRailsSection({
  id,
  title,
  items,
}: VerificationRailsSectionProps) {
  return (
    <section id={id} className="section-shell">
      <Container className="section-shell">
        <h2 className="text-section-heading font-semibold mb-4">{title}</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${focusRingClass} block rounded-md border border-border bg-surface-elevated p-4 transition-colors motion-reduce:transition-none hover:border-accent hover:bg-surface`}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="text-accent font-semibold mt-0.5 shrink-0"
                >
                  →
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-text mb-1">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="text-sm text-muted leading-relaxed">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
