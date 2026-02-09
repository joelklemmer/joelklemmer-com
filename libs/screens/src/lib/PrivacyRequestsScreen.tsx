import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Container } from '@joelklemmer/ui';
import { HeroSection } from '@joelklemmer/sections';
import type { AppLocale } from '@joelklemmer/i18n';

export async function generateMetadata() {
  return {
    title: 'Privacy requests',
    description:
      'Submit a privacy request. We route requests through our contact pathway.',
  };
}

export const privacyRequestsMetadata = generateMetadata;

export async function PrivacyRequestsScreen() {
  const locale = (await getLocale()) as AppLocale;
  const title = 'Privacy requests';
  const lede =
    'To exercise your rights (access, rectification, erasure, portability, objection), please use our contact pathway. We do not use external request portals.';

  return (
    <>
      <HeroSection title={title} lede={lede} />
      <section
        className="section-shell"
        aria-labelledby="privacy-requests-heading"
      >
        <Container className="section-shell">
          <h2 id="privacy-requests-heading" className="sr-only">
            {title}
          </h2>
          <p className="text-sm text-muted">
            <Link
              href={`/${locale}/contact`}
              className="underline hover:no-underline"
            >
              Contact us
            </Link>{' '}
            to submit a privacy request. We will respond in line with our
            privacy policy.
          </p>
        </Container>
      </section>
    </>
  );
}
