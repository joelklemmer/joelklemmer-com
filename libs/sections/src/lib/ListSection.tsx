import { Container } from '@joelklemmer/ui';

export interface ListSectionProps {
  title: string;
  items: string[];
}

export function ListSection({ title, items }: ListSectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        <div className="authority-card rounded-lg border border-border">
          <h2 className="text-section-heading font-semibold mb-4">{title}</h2>
          <ul className="grid gap-3 text-base text-muted">
            {items.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="text-accent font-semibold">
                  •
                </span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
