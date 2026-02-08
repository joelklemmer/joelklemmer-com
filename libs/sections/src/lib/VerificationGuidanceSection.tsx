import { Container } from '@joelklemmer/ui';

export interface VerificationGuidanceSectionProps {
  title: string;
  body: string;
}

export function VerificationGuidanceSection({
  title,
  body,
}: VerificationGuidanceSectionProps) {
  return (
    <section
      className="section-shell"
      aria-labelledby="verification-guidance-heading"
    >
      <Container className="section-shell">
        <h2
          id="verification-guidance-heading"
          className="text-section-heading font-semibold"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted">{body}</p>
      </Container>
    </section>
  );
}
