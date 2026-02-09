import { getLocale, getTranslations } from 'next-intl/server';
import {
  loadMessages,
  createScopedTranslator,
  type AppLocale,
} from '@joelklemmer/i18n';
import { Container } from '@joelklemmer/ui';
import { HeroSection } from '@joelklemmer/sections';
import { ConsentPreferencesForm } from '@joelklemmer/compliance';

export async function generateMetadata() {
  const t = await getTranslations('consent.meta');
  return {
    title: t('preferencesTitle'),
    description: t('preferencesDescription'),
  };
}

export const preferencesMetadata = generateMetadata;

export async function PreferencesScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['consent']);
  const t = createScopedTranslator(locale, messages, 'consent.preferences');
  const title = t('title');
  const lede = t('intro');

  return (
    <>
      <HeroSection title={title} lede={lede} />
      <section className="section-shell" aria-labelledby="preferences-heading">
        <Container className="section-shell">
          <h2 id="preferences-heading" className="sr-only">
            {title}
          </h2>
          <ConsentPreferencesForm />
        </Container>
      </section>
    </>
  );
}
