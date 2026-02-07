import { Container } from '@joelklemmer/ui';

export interface IdentityScopeSectionProps {
  /** Dense 2–4 sentence identity and scope paragraph */
  body: string;
}

export function IdentityScopeSection({ body }: IdentityScopeSectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        <p className="max-w-2xl text-base text-muted">{body}</p>
      </Container>
    </section>
  );
}
