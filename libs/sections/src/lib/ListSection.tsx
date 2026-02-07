import { Container } from '@joelklemmer/ui';

export interface ListSectionProps {
  title: string;
  items: string[];
}

export function ListSection({ title, items }: ListSectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        <h2 className="text-title font-semibold">{title}</h2>
        <ul className="grid gap-2 text-base text-muted">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
