import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface MailtoComposerSectionProps {
  heading: string;
  buttonLabel: string;
  mailtoHref: string;
  bodyTemplateLabel?: string;
  requiredFields?: Array<{ key: string; label: string }>;
}

export function MailtoComposerSection({
  heading,
  buttonLabel,
  mailtoHref,
  bodyTemplateLabel,
  requiredFields,
}: MailtoComposerSectionProps) {
  return (
    <section
      className="section-shell"
      aria-labelledby="mailto-heading"
      aria-live="polite"
    >
      <Container className="section-shell">
        <h2 id="mailto-heading" className="text-section-heading font-semibold">
          {heading}
        </h2>
        <p className="mt-2">
          <Link
            href={mailtoHref}
            className={`inline-block rounded-md border border-border px-4 py-2 text-sm font-medium text-text hover:border-accent hover:text-accent ${focusRingClass}`}
          >
            {buttonLabel}
          </Link>
        </p>
        {bodyTemplateLabel && requiredFields && requiredFields.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-text">{bodyTemplateLabel}</p>
            <dl className="mt-2 grid gap-1 text-sm text-muted">
              {requiredFields.map(({ key, label }) => (
                <div key={key} className="flex gap-2">
                  <dt className="shrink-0 font-medium after:content-[':']">
                    {label}
                  </dt>
                  <dd className="min-w-0" />
                </div>
              ))}
            </dl>
          </div>
        )}
      </Container>
    </section>
  );
}
