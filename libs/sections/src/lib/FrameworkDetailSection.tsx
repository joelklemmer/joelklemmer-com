import { Container } from '@joelklemmer/ui';
import { FrameworkIntentBand } from './FrameworkIntentBand.client';

export interface FrameworkDetailItem {
  /** Already-translated title (i18n). */
  title: string;
  /** Already-translated 10s intent (i18n). */
  intent10: string;
  /** Already-translated 60s intent (i18n). */
  intent60: string;
  /** Optional deep content (React node). */
  deepContent?: React.ReactNode;
}

export interface FrameworkDetailSectionProps {
  /** Section id for anchor (e.g. doctrine). */
  id: string;
  /** Already-translated section title (i18n). */
  title: string;
  /** Already-translated lede (i18n). */
  lede?: string;
  /** Framework items to render. */
  items: FrameworkDetailItem[];
  /** Already-translated "Expand full context" label (i18n). */
  expandLabel?: string;
}

/**
 * Section that lists frameworks with intent bands (10s, 60s, deep).
 * Uses density view: in density mode emphasizes intent10 and intent60, collapses deep.
 * All visible strings must be i18n-resolved.
 */
export function FrameworkDetailSection({
  id,
  title,
  lede,
  items,
  expandLabel,
}: FrameworkDetailSectionProps) {
  return (
    <section id={id} className="section-shell">
      <Container className="section-shell">
        <div className="section-shell">
          <h2 className="text-section-heading font-semibold">{title}</h2>
          {lede ? (
            <p className="text-body-analytical text-muted">{lede}</p>
          ) : null}
        </div>
        <div className="mt-6 space-y-8">
          {items.map((item) => (
            <div key={item.title} className="authority-card p-4">
              <h3 className="text-lg font-semibold text-text mb-3">
                {item.title}
              </h3>
              <FrameworkIntentBand
                intent10={item.intent10}
                intent60={item.intent60}
                deepContent={item.deepContent}
                expandLabel={expandLabel}
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
