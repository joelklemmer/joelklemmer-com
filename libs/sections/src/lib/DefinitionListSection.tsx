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
        <h2 className="text-title font-semibold">{title}</h2>
        <dl className="grid gap-4 text-sm text-muted md:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="section-shell">
              <dt className="text-xs font-semibold uppercase tracking-wide text-text">
                {item.label}
              </dt>
              <dd className="text-base text-muted">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
