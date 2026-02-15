import type { ReactNode } from 'react';
import { Fragment, Suspense } from 'react';
import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import {
  buildMetadata,
  getCriticalPreloadLinks,
  BreadcrumbJsonLd,
  OrganizationJsonLd,
  PersonJsonLd,
  WebSiteJsonLd,
} from '@joelklemmer/seo';
import {
  HeroSection,
  InstitutionalDomainsSection,
  InstitutionalScaleSection,
} from '@joelklemmer/sections';

const HOME_HERO_IMAGE_PATH =
  '/media/portraits/joel-klemmer__portrait__studio-graphite__2026-01__01__hero.webp';

/** Section order: H1 (hero) first, then H2 sections. Figma Make design. */
type SectionId = 'hero' | 'domains' | 'institutionalScale';
const HOME_IA_ORDER: SectionId[] = ['hero', 'domains', 'institutionalScale'];

export async function generateMetadata(options?: { baseUrl?: string }) {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['seo', 'meta']);
  return buildMetadata({
    locale,
    routeKey: 'home',
    pathname: '/',
    baseUrl: options?.baseUrl,
    messages,
    ogImageSlug: 'home',
    criticalPreloadLinks: getCriticalPreloadLinks({
      heroImageHref: HOME_HERO_IMAGE_PATH,
    }),
  });
}

export const homeMetadata = generateMetadata;

/** Below-fold content in its own async boundary so server can stream hero first (LCP). */
async function HomeBelowFold() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['home']);
  const t = createScopedTranslator(locale, messages, 'home');

  return (
    <>
      <InstitutionalDomainsSection
        title={t('domains.title')}
        governance={{
          title: t('domains.governance.title'),
          description: t('domains.governance.description'),
        }}
        capital={{
          title: t('domains.capital.title'),
          description: t('domains.capital.description'),
        }}
        operational={{
          title: t('domains.operational.title'),
          description: t('domains.operational.description'),
        }}
      />
      <InstitutionalScaleSection
        title={t('section3.title')}
        intro={t('section3.intro')}
        block1={{
          title: t('section3.block1.title'),
          body: t('section3.block1.body'),
        }}
        block2={{
          title: t('section3.block2.title'),
          body: t('section3.block2.body'),
        }}
        block3={{
          title: t('section3.block3.title'),
          body: t('section3.block3.body'),
        }}
        cta={t('section3.cta')}
        ctaHref={`/${locale}/work`}
      />
    </>
  );
}

export async function HomeScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['home']);
  const t = createScopedTranslator(locale, messages, 'home');

  const ctaSecondary = t('hero.ctaSecondary');
  const heroActions = [
    {
      label: t('hero.cta'),
      href: `/${locale}/brief`,
      variant: 'primary' as const,
    },
    ...(ctaSecondary
      ? [
          {
            label: ctaSecondary,
            href: `/${locale}/work`,
            variant: 'secondary' as const,
          },
        ]
      : []),
  ];

  const hero = (
    <HeroSection
      thesisLines={[t('hero.thesis1'), t('hero.thesis2'), t('hero.thesis3')]}
      lede={t('hero.lede')}
      actions={heroActions}
      visual={{
        src: HOME_HERO_IMAGE_PATH,
        alt: t('hero.portraitAlt'),
        width: 1200,
        height: 1500,
        objectPosition: 'right 32%',
      }}
      imagePriority
    />
  );

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd locale={locale} />
      <PersonJsonLd />
      <BreadcrumbJsonLd locale={locale} pathSegments={[]} />
      {/* Canonical responsive container: max-w-6xl (~1200px), px-6 lg:px-8, single lane aligns with masthead */}
      <div className="home-canonical-container home-content-band">
        <div className="content-lane-grid">
          <Fragment key="hero">{hero}</Fragment>
          <Suspense fallback={null}>
            <HomeBelowFold />
          </Suspense>
        </div>
      </div>
    </>
  );
}
