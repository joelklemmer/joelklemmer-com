import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';

function CardInner({
  caseTitle,
  sector,
  sectorValue,
  capitalScale,
  capitalValue,
  impact,
  impactValue,
  summary,
}: {
  caseTitle: string;
  sector: string;
  sectorValue: string;
  capitalScale: string;
  capitalValue: string;
  impact: string;
  impactValue: string;
  summary: string;
}) {
  return (
    <>
      <h3 className="text-lg font-semibold text-text mb-4">{caseTitle}</h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 text-start mb-4">
        <div>
          <div className="text-meta-label uppercase tracking-wide text-muted mb-1">
            {sector}
          </div>
          <div className="text-body-analytical font-medium text-text">
            {sectorValue}
          </div>
        </div>
        <div>
          <div className="text-meta-label uppercase tracking-wide text-muted mb-1">
            {capitalScale}
          </div>
          <div className="text-body-analytical font-medium text-text">
            {capitalValue}
          </div>
        </div>
        <div>
          <div className="text-meta-label uppercase tracking-wide text-muted mb-1">
            {impact}
          </div>
          <div className="text-body-analytical font-medium text-text">
            {impactValue}
          </div>
        </div>
      </div>
      <p className="max-w-[42rem] text-body-analytical text-muted leading-relaxed">
        {summary}
      </p>
    </>
  );
}

export interface SelectedWorkSectionProps {
  title: string;
  viewAll: string;
  viewAllHref: string;
  /** Optional: when set, the featured block links to this href (card-style) */
  caseHref?: string;
  caseTitle: string;
  sector: string;
  sectorValue: string;
  capitalScale: string;
  capitalValue: string;
  impact: string;
  impactValue: string;
  summary: string;
}

export function SelectedWorkSection({
  title,
  viewAll,
  viewAllHref,
  caseHref,
  caseTitle,
  sector,
  sectorValue,
  capitalScale,
  capitalValue,
  impact,
  impactValue,
  summary,
}: Omit<SelectedWorkSectionProps, 'locale'>) {
  return (
    <section
      id="selected-work"
      className="section-shell"
      aria-labelledby="selected-work-heading"
    >
      <div className="py-10 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <h2
            id="selected-work-heading"
            className="text-section-heading font-semibold text-text"
          >
            {title}
          </h2>
          <Link
            href={viewAllHref}
            prefetch={false}
            className={`${focusRingClass} inline-flex rounded-none border border-border px-4 py-2 font-serif text-sm font-medium text-accent transition-colors motion-reduce:transition-none hover:border-accent hover:text-accent-strong`}
          >
            {viewAll}
          </Link>
        </div>

        <div
          className={
            caseHref
              ? `${focusRingClass} block authority-card mt-6 transition-colors motion-reduce:transition-none`
              : 'authority-card mt-6'
          }
        >
          {caseHref ? (
            <Link href={caseHref} prefetch={false} className="block">
              <CardInner
                caseTitle={caseTitle}
                sector={sector}
                sectorValue={sectorValue}
                capitalScale={capitalScale}
                capitalValue={capitalValue}
                impact={impact}
                impactValue={impactValue}
                summary={summary}
              />
            </Link>
          ) : (
            <CardInner
              caseTitle={caseTitle}
              sector={sector}
              sectorValue={sectorValue}
              capitalScale={capitalScale}
              capitalValue={capitalValue}
              impact={impact}
              impactValue={impactValue}
              summary={summary}
            />
          )}
        </div>
      </div>
    </section>
  );
}
