import type { ReactNode } from 'react';
import { Container } from '@joelklemmer/ui';

export interface IdentityScopeSectionProps {
  /** Dense 2–4 sentence identity and scope paragraph */
  body: string;
  /** Optional visual zone (token-aware anchor) for authority presence */
  visualAnchor?: ReactNode;
}

export function IdentityScopeSection({
  body,
  visualAnchor,
}: IdentityScopeSectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        {visualAnchor ? (
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
            <p className="max-w-2xl text-body-analytical text-muted">{body}</p>
            <div className="min-w-0 max-w-[12rem]">{visualAnchor}</div>
          </div>
        ) : (
          <p className="max-w-2xl text-body-analytical text-muted">{body}</p>
        )}
      </Container>
    </section>
  );
}
