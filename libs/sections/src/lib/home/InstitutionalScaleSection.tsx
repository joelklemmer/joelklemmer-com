/**
 * Institutional Scale & Executive Stewardship section.
 * Three-column grid: National Security, Federal Healthcare, Public Infrastructure.
 * RTL-safe via logical properties. Same vertical rhythm as Core Institutional Domains.
 */
import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';

export interface InstitutionalScaleSectionProps {
  title: string;
  intro: string;
  block1: { title: string; body: string };
  block2: { title: string; body: string };
  block3: { title: string; body: string };
  cta: string;
  ctaHref: string;
}

export function InstitutionalScaleSection({
  title,
  intro,
  block1,
  block2,
  block3,
  cta,
  ctaHref,
}: InstitutionalScaleSectionProps) {
  return (
    <section
      id="institutional-scale"
      className="section-shell"
      aria-labelledby="institutional-scale-heading"
    >
      <div className="py-16 sm:py-20 lg:py-24">
        <h2
          id="institutional-scale-heading"
          className="text-section-heading font-semibold text-text"
        >
          {title}
        </h2>
        <p className="mt-8 text-body-analytical text-muted leading-relaxed max-w-3xl text-start">
          {intro}
        </p>
        <div className="mt-16 grid grid-cols-1 items-start gap-8 sm:gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-12 text-start">
          <div className="flex flex-col items-start w-full min-w-0">
            <div className="institutional-scale-title-block mb-6 w-full min-h-0 md:min-h-[3.5rem]">
              <h3 className="text-lg font-semibold tracking-tight text-text leading-snug md:line-clamp-2">
                {block1.title}
              </h3>
            </div>
            <p className="text-body-analytical text-muted leading-relaxed">
              {block1.body}
            </p>
          </div>
          <div className="flex flex-col items-start w-full min-w-0">
            <div className="institutional-scale-title-block mb-6 w-full min-h-0 md:min-h-[3.5rem]">
              <h3 className="text-lg font-semibold tracking-tight text-text leading-snug md:line-clamp-2">
                {block2.title}
              </h3>
            </div>
            <p className="text-body-analytical text-muted leading-relaxed">
              {block2.body}
            </p>
          </div>
          <div className="flex flex-col items-start w-full min-w-0">
            <div className="institutional-scale-title-block mb-6 w-full min-h-0 md:min-h-[3.5rem]">
              <h3 className="text-lg font-semibold tracking-tight text-text leading-snug md:line-clamp-2">
                {block3.title}
              </h3>
            </div>
            <p className="text-body-analytical text-muted leading-relaxed">
              {block3.body}
            </p>
          </div>
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href={ctaHref}
            prefetch={false}
            className={`${focusRingClass} inline-flex min-h-[44px] items-center justify-center rounded-none border border-border px-4 py-3 font-serif text-sm font-medium text-accent transition-colors motion-reduce:transition-none hover:border-accent hover:text-accent-strong`}
          >
            {cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
