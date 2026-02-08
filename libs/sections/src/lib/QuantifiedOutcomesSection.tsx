import { Container } from '@joelklemmer/ui';

export interface QuantifiedOutcomeItem {
  metric: string;
  value: string;
  context: string;
}

export interface QuantifiedOutcomesSectionProps {
  title: string;
  items: QuantifiedOutcomeItem[];
}

export function QuantifiedOutcomesSection({
  title,
  items,
}: QuantifiedOutcomesSectionProps) {
  if (items.length === 0) return null;
  return (
    <section className="section-shell">
      <Container className="section-shell">
        <h2 className="text-title font-semibold">{title}</h2>
        <dl className="mt-2 grid gap-2 text-base text-muted">
          {items.map((item, i) => (
            <div key={i}>
              <dt className="font-medium text-text">
                {item.metric}: {item.value}
              </dt>
              <dd className="ml-0 text-sm">{item.context}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
