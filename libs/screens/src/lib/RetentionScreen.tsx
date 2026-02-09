import { getTranslations } from 'next-intl/server';
import { Container } from '@joelklemmer/ui';
import { HeroSection } from '@joelklemmer/sections';

export interface RetentionScreenProps {
  entries: Array<{ id: string; name: string; retention: string }>;
}

export async function generateMetadata() {
  return {
    title: 'Data retention',
    description:
      'Retention periods by vendor and data type. Generated from the compliance registry.',
  };
}

export const retentionMetadata = generateMetadata;

export async function RetentionScreen({ entries }: RetentionScreenProps) {
  const title = 'Data retention';
  const lede =
    'Retention periods for data processed by the platform. Generated from the compliance registry.';

  return (
    <>
      <HeroSection title={title} lede={lede} />
      <section className="section-shell" aria-labelledby="retention-heading">
        <Container className="section-shell">
          <h2 id="retention-heading" className="sr-only">
            {title}
          </h2>
          <dl className="space-y-2 text-sm">
            {entries.map((e) => (
              <div key={e.id} className="flex gap-2">
                <dt className="font-medium text-text">{e.name}</dt>
                <dd className="text-muted">{e.retention}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
    </>
  );
}
