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
  SelectedWorkSection,
} from '@joelklemmer/sections';
import { Container } from '@joelklemmer/ui';

const HOME_HERO_IMAGE_PATH =
  '/media/portraits/joel-klemmer__portrait__studio-graphite__2026-01__01__hero.webp';

/** Section order: H1 (hero) first, then H2 sections. Figma Make design. */
type SectionId = 'hero' | 'domains' | 'selectedWork';
const HOME_IA_ORDER: SectionId[] = ['hero', 'domains', 'selectedWork'];

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
      <SelectedWorkSection
        title={t('selectedWork.title')}
        viewAll={t('selectedWork.viewAll')}
        viewAllHref={`/${locale}/work`}
        caseHref={`/${locale}/work`}
        caseTitle={t('selectedWork.caseTitle')}
        sector={t('selectedWork.sector')}
        sectorValue={t('selectedWork.sectorValue')}
        capitalScale={t('selectedWork.capitalScale')}
        capitalValue={t('selectedWork.capitalValue')}
        impact={t('selectedWork.impact')}
        impactValue={t('selectedWork.impactValue')}
        summary={t('selectedWork.summary')}
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
      {/* Figma: unified content band max 1280px; single lane aligns with masthead */}
      <Container variant="wide" className="home-content-band">
        <div className="content-lane-grid">
          <Fragment key="hero">{hero}</Fragment>
          <Suspense fallback={null}>
            <HomeBelowFold />
          </Suspense>
        </div>
      </Container>
    </>
  );
}
