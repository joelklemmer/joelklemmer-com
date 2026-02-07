import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getContactPathways } from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import { HeroSection } from '@joelklemmer/sections';

import { ContactIntakeBlock } from './ContactIntakeBlock';

export async function generateMetadata() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['meta']);
  const t = createScopedTranslator(locale, messages, 'meta');
  return createPageMetadata({
    title: t('contact.title'),
    description: t('contact.description'),
    locale,
    pathname: '/contact',
  });
}

export const contactMetadata = generateMetadata;

export async function ContactScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['contact']);
  const t = createScopedTranslator(locale, messages, 'contact');

  const pathways = getContactPathways();
  const pathwayOptions = pathways.map((p) => ({
    id: p.id,
    label: t(p.labelKey),
    description: t(p.descriptionKey),
    cta: t(p.ctaKey),
    subjectTemplate: t(p.subjectTemplateKey),
    recommendedFields: p.recommendedFields,
  }));

  const guidanceBullets = t.raw('guidance.bullets') as string[];
  const requiredInfo = t.raw('requiredInfo') as Record<string, string>;

  const contactEmail =
    typeof process.env.NEXT_PUBLIC_CONTACT_EMAIL === 'string'
      ? process.env.NEXT_PUBLIC_CONTACT_EMAIL.trim()
      : undefined;

  return (
    <>
      <HeroSection title={t('title')} lede={t('lede')} />
      <ContactIntakeBlock
        pathwayOptions={pathwayOptions}
        pathwaySelectorLabel={t('pathwaySelectorLabel')}
        guidanceHeading={t('guidance.heading')}
        guidanceBullets={guidanceBullets}
        mailtoHeading={t('mailto.heading')}
        mailtoButtonLabel={t('mailto.buttonLabel')}
        bodyTemplateLabel={t('mailto.bodyTemplateLabel')}
        requiredInfo={requiredInfo}
        contactEmail={contactEmail}
      />
    </>
  );
}
