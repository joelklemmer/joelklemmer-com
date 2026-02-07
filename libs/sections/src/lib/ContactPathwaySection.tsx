import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface ContactPathwaySectionProps {
  title: string;
  linkLabel: string;
  href: string;
}

export function ContactPathwaySection({
  title,
  linkLabel,
  href,
}: ContactPathwaySectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        <h2 className="text-title font-semibold">{title}</h2>
        <Link
          href={href}
          className={`mt-2 inline-block ${focusRingClass} text-base text-muted underline underline-offset-4 hover:text-accent`}
        >
          {linkLabel}
        </Link>
      </Container>
    </section>
  );
}
