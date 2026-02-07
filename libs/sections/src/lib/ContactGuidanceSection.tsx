import { Container } from '@joelklemmer/ui';

export interface ContactGuidanceSectionProps {
  heading: string;
  bullets: string[];
}

export function ContactGuidanceSection({
  heading,
  bullets,
}: ContactGuidanceSectionProps) {
  return (
    <section
      className="section-shell"
      aria-labelledby="contact-guidance-heading"
    >
      <Container className="section-shell">
        <h2 id="contact-guidance-heading" className="text-title font-semibold">
          {heading}
        </h2>
        <ul className="mt-3 grid gap-2 text-base text-muted">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span aria-hidden="true">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
