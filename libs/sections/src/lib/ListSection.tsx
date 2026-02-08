import { Container } from '@joelklemmer/ui';

export interface ListSectionProps {
  title: string;
  items: string[];
}

export function ListSection({ title, items }: ListSectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        <h2 className="text-section-heading font-semibold mb-4">{title}</h2>
        <ul className="grid gap-3 text-base text-muted">
          {items.map((item) => (
            <li key={item} className="flex gap-3 items-start">
              <span aria-hidden="true" className="text-accent mt-1">•</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
