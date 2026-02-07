import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface CaseStudyReference {
  label: string;
  href: string;
  meta?: string;
}

export interface CaseStudySectionLabels {
  context: string;
  constraints: string;
  actions: string;
  outcomes: string;
  references: string;
}

export interface CaseStudySectionProps {
  id?: string;
  title: string;
  summary?: string;
  meta?: string;
  detailLink?: {
    label: string;
    href: string;
  };
  context: string[];
  constraints: string[];
  actions: string[];
  outcomes: string[];
  references?: CaseStudyReference[];
  labels: CaseStudySectionLabels;
}

export function CaseStudySection({
  id,
  title,
  summary,
  meta,
  detailLink,
  context,
  constraints,
  actions,
  outcomes,
  references,
  labels,
}: CaseStudySectionProps) {
  const sections = [
    { label: labels.context, items: context },
    { label: labels.constraints, items: constraints },
    { label: labels.actions, items: actions },
    { label: labels.outcomes, items: outcomes },
  ];

  return (
    <section id={id} className="section-shell">
      <Container className="section-shell">
        <div className="section-shell">
          <h2 className="text-title font-semibold">{title}</h2>
          {summary ? <p className="text-base text-muted">{summary}</p> : null}
          {meta ? <p className="text-xs text-muted">{meta}</p> : null}
          {detailLink ? (
            <Link
              href={detailLink.href}
              className={`${focusRingClass} inline-flex rounded-sm text-sm underline underline-offset-4`}
            >
              {detailLink.label}
            </Link>
          ) : null}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.label} className="section-shell">
              <h3 className="text-base font-semibold">{section.label}</h3>
              <ul className="grid gap-2 text-sm text-muted">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {references?.length ? (
          <div className="section-shell">
            <h3 className="text-base font-semibold">{labels.references}</h3>
            <ul className="grid gap-2 text-sm text-muted">
              {references.map((reference) => (
                <li key={reference.href}>
                  <Link
                    href={reference.href}
                    className={`${focusRingClass} rounded-sm underline underline-offset-4 hover:text-text`}
                  >
                    {reference.label}
                  </Link>
                  {reference.meta ? (
                    <span className="text-xs text-muted">
                      {' '}
                      · {reference.meta}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
