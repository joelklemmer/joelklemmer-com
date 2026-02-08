import type { ReactNode } from 'react';
import { Container } from '@joelklemmer/ui';

export interface DefinitionListItem {
  label: string;
  value: ReactNode;
}

export interface DefinitionListSectionProps {
  title: string;
  items: DefinitionListItem[];
}

export function DefinitionListSection({
  title,
  items,
}: DefinitionListSectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        <h2 className="text-section-heading font-semibold">{title}</h2>
        <dl className="grid gap-4 text-sm text-muted md:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="section-shell">
              <dt className="text-meta-label font-semibold uppercase tracking-wide text-text">
                {item.label}
              </dt>
              <dd className="text-body-analytical text-muted">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
