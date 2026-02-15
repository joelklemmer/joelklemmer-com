import { getLocale, getTranslations } from 'next-intl/server';
import {
  loadMessages,
  createScopedTranslator,
  type AppLocale,
} from '@joelklemmer/i18n';
import { Container } from '@joelklemmer/ui';
import {
  PreferencesPageContent,
  type PreferencesPageLabels,
} from './PreferencesPageContent';

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
  const messages = await loadMessages(locale, ['consent', 'footer', 'common']);
  const t = createScopedTranslator(locale, messages, 'consent.preferences');
  const tFooter = createScopedTranslator(locale, messages, 'footer.links');
  const tPrefs = createScopedTranslator(locale, messages, 'common.preferences');
  const tA11y = createScopedTranslator(locale, messages, 'common.a11y');
  const title = tFooter('preferences');
  const lede = t('intro');

  const labels: PreferencesPageLabels = {
    cookieConsent: tPrefs('cookieConsent'),
    consentSaved: tPrefs('consentSaved'),
    noPreferenceSaved: tPrefs('noPreferenceSaved'),
    changeCookieSettings: tPrefs('changeCookieSettings'),
    clearCookiePreference: tPrefs('clearCookiePreference'),
    clearedNote: tPrefs('clearedNote'),
    accessibilityPreferences: tPrefs('accessibilityPreferences'),
    contrastLabel: tA11y('contrastLabel'),
    contrastDefault: tA11y('contrastDefault'),
    contrastHigh: tA11y('contrastHigh'),
    motionLabel: tA11y('motionLabel'),
    textSizeLabel: tA11y('textSizeLabel'),
    textSizeDefault: tA11y('textSizeDefault'),
    textSizeMedium: tA11y('textSizeMedium'),
    textSizeLarge: tA11y('textSizeLarge'),
    lineHeightComfortable: tA11y('lineHeightComfortable'),
    letterSpacingIncreased: tA11y('letterSpacingIncreased'),
    dyslexiaFontLabel: tA11y('dyslexiaFontLabel'),
    resetToDefaults: tA11y('resetToDefaults'),
  };

  return (
    <div
      data-page="preferences"
      className="home-canonical-container home-content-band preferences-page-root"
    >
      <Container className="preferences-page-inner">
        <header className="preferences-header">
          <h1 id="preferences-heading" className="preferences-title">
            {title}
          </h1>
          <p className="preferences-lede text-muted">{lede}</p>
        </header>
        <PreferencesPageContent labels={labels} />
      </Container>
    </div>
  );
}
