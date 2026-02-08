import type { ReactNode } from 'react';
import { Container } from '@joelklemmer/ui';

export interface MdxSectionProps {
  title?: string;
  children: ReactNode;
}

export function MdxSection({ title, children }: MdxSectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        {title ? (
          <h2 className="text-section-heading font-semibold">{title}</h2>
        ) : null}
        <div className="mdx-content">{children}</div>
      </Container>
    </section>
  );
}
