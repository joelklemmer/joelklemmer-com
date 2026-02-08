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
        <div className="authority-card rounded-lg border border-border p-6 bg-surface-elevated">
          <p className="text-base text-muted">
            {sentence}{' '}
            <Link
              href={href}
              className={`${focusRingClass} font-medium text-accent hover:text-accent-strong transition-colors motion-reduce:transition-none`}
            >
              {linkLabel}
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
