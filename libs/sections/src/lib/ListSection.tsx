import type { ContainerVariant } from '@joelklemmer/ui';
import { Container } from '@joelklemmer/ui';

export interface ListSectionProps {
  title: string;
  items: string[];
  /** Lane variant for content; default readable for list copy. */
  containerVariant?: ContainerVariant;
}

export function ListSection({
  title,
  items,
  containerVariant = 'readable',
}: ListSectionProps) {
  return (
    <section className="section-shell authority-list-section">
      <Container variant={containerVariant} className="section-shell">
        <div className="authority-card authority-card-inner">
          <h2 className="text-section-heading font-semibold">{title}</h2>
          {items.length > 0 ? (
            <ul className="authority-list text-base">
              {items.map((item) => (
                <li key={item}>
                  <span aria-hidden="true" className="authority-list-bullet">
                    •
                  </span>
                  <span className="authority-list-item-text flex-1">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
