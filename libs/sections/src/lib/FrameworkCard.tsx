import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';

export interface FrameworkCardProps {
  /** Already-translated title (i18n). */
  title: string;
  /** Already-translated summary (i18n). */
  summary: string;
  /** Already-translated 10s intent (i18n). Optional; shown on density view. */
  intent10?: string;
  /** Optional anchor or path for deep link (e.g. #doctrine or /brief#doctrine). */
  href?: string;
}

/**
 * Compact card for a framework/doctrine. All visible strings must be i18n-resolved.
 * Used in Home (3 cards) and in Brief doctrine section.
 */
export function FrameworkCard({
  title,
  summary,
  intent10,
  href,
}: FrameworkCardProps) {
  const description = intent10 ?? summary;
  const content = (
    <div className="authority-card section-shell rounded-lg border border-border/60 bg-surface p-6 hover:border-accent/40 transition-colors motion-reduce:transition-none">
      <div className="section-shell">
        <h3 className="text-xl font-semibold text-text mb-2">{title}</h3>
        {description ? (
          <p className="text-body-analytical text-base text-muted leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${focusRingClass} block rounded-lg hover:scale-[1.01] transition-transform motion-reduce:transition-none`}
        aria-label={title}
      >
        {content}
      </Link>
    );
  }
  return <div>{content}</div>;
}
