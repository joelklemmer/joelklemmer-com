import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface StartHereSectionProps {
  sentence: string;
  linkLabel: string;
  href: string;
}

export function StartHereSection({
  sentence,
  linkLabel,
  href,
}: StartHereSectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        <p className="text-base text-muted">
          {sentence}{' '}
          <Link
            href={href}
            className={`${focusRingClass} underline underline-offset-4 hover:text-accent`}
          >
            {linkLabel}
          </Link>
        </p>
      </Container>
    </section>
  );
}
