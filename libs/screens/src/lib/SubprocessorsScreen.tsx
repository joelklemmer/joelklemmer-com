import { getTranslations } from 'next-intl/server';
import { Container } from '@joelklemmer/ui';
import { HeroSection } from '@joelklemmer/sections';

export interface SubprocessorsScreenProps {
  vendors: Array<{
    id: string;
    name: string;
    owner?: string;
    subprocessors?: string[];
    transferRegions?: string[];
  }>;
}

export async function generateMetadata() {
  const t = await getTranslations('consent.meta');
  return {
    title: 'Subprocessors',
    description: t('preferencesDescription'),
  };
}

export const subprocessorsMetadata = generateMetadata;

export async function SubprocessorsScreen({
  vendors,
}: SubprocessorsScreenProps) {
  const title = 'Subprocessors';
  const lede =
    'Vendors and subprocessors that may process data. Generated from the compliance registry.';

  return (
    <>
      <HeroSection title={title} lede={lede} />
      <section
        className="section-shell"
        aria-labelledby="subprocessors-heading"
      >
        <Container className="section-shell">
          <h2 id="subprocessors-heading" className="sr-only">
            {title}
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-text">
            {vendors.map((v) => (
              <li key={v.id}>
                <strong>{v.name}</strong>
                {v.owner ? ` (${v.owner})` : ''}
                {v.transferRegions?.length
                  ? ` — ${v.transferRegions.join(', ')}`
                  : ''}
                {v.subprocessors?.length
                  ? ` — subprocessors: ${v.subprocessors.join(', ')}`
                  : ''}
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
