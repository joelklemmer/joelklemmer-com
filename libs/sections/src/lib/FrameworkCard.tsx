import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

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
    <div className="section-shell rounded-card border border-border bg-surface p-4">
      <div className="section-shell">
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        {description ? (
          <p className="text-sm text-muted">{description}</p>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${focusRingClass} block rounded-card`}
        aria-label={title}
      >
        {content}
      </Link>
    );
  }
  return <div>{content}</div>;
}
