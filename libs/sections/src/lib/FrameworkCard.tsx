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
  /** Optional prefetch control for performance (default true when href set). */
  prefetch?: boolean;
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
  prefetch = true,
}: FrameworkCardProps) {
  const description = intent10 ?? summary;
  const content = (
    <div className="authority-card authority-card-doctrine section-shell h-full flex flex-col">
      <div className="authority-card-inner section-shell flex-1">
        <h3 className="authority-card-title text-lg font-semibold">{title}</h3>
        {description ? (
          <p className="authority-card-body text-body-analytical text-sm">
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
        prefetch={prefetch}
        className={`${focusRingClass} block transition-transform motion-reduce:transition-none hover:scale-[1.02]`}
      >
        {content}
      </Link>
    );
  }
  return <div>{content}</div>;
}
