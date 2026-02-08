import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import type { SectionId } from '@joelklemmer/authority-orchestration';
import {
  createPageMetadata,
  PersonJsonLd,
  WebSiteJsonLd,
} from '@joelklemmer/seo';
import {
  FrameworkCard,
  HeroSection,
  ListSection,
  SectionVisualAnchor,
  VerificationRailsSection,
} from '@joelklemmer/sections';
import Link from 'next/link';
import { Container } from '@joelklemmer/ui';
import { focusRingClass } from '@joelklemmer/a11y';
import { getFrameworkList } from '@joelklemmer/content';

export async function generateMetadata() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['meta']);
  const t = createScopedTranslator(locale, messages, 'meta');
  return createPageMetadata({
    title: t('home.title'),
    description: t('home.description'),
    locale,
    pathname: '/',
    ogImageSlug: 'home',
  });
}

export const homeMetadata = generateMetadata;

const HOME_SECTION_IDS: SectionId[] = ['hero', 'routes', 'claims', 'doctrine'];

/** Fixed IA order: Hero first, then Executive Brief (dominant) + Verification rails, Claim summary, Frameworks & doctrine. */
const HOME_IA_ORDER: SectionId[] = ['hero', 'routes', 'claims', 'doctrine'];

export async function HomeScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['home', 'frameworks']);
  const t = createScopedTranslator(locale, messages, 'home');
  const tFw = createScopedTranslator(locale, messages, 'frameworks');
  const claimItems = t.raw('claims.items') as string[];
  const routeItems = t.raw('routes.items') as Array<{
    title: string;
    description: string;
    path: string;
  }>;
  const frameworks = (await getFrameworkList()).slice(0, 3);
  const briefDoctrineAnchor = `/${locale}/brief#doctrine`;

  const hero = (
    <HeroSection
      title={t('hero.title')}
      lede={t('hero.lede')}
      actions={[{ label: t('hero.cta'), href: `/${locale}/brief` }]}
      visual={{
        src: '/media/portraits/joel-klemmer__portrait__studio-graphite__2026-01__01__hero.webp',
        alt: t('hero.portraitAlt'),
        width: 1200,
        height: 1500,
      }}
    />
  );

  const claims = <ListSection title={t('claims.title')} items={claimItems} />;
  const doctrine =
    frameworks.length > 0 ? (
      <section id="doctrine" className="section-shell">
        <Container className="section-shell">
          <SectionVisualAnchor className="mb-6" />
          <div className="section-shell mb-6">
            <h2 className="text-section-heading font-semibold">
              {tFw('section.title')}
            </h2>
            <p className="text-body-analytical text-muted mt-2">
              {tFw('section.lede')}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {frameworks.map((fw) => (
              <FrameworkCard
                key={fw.frontmatter.id}
                title={tFw(fw.frontmatter.titleKey)}
                summary={tFw(fw.frontmatter.summaryKey)}
                intent10={tFw(fw.frontmatter.intent10Key)}
                href={briefDoctrineAnchor}
              />
            ))}
          </div>
        </Container>
      </section>
    ) : null;

  // Routes section: Executive Brief (dominant) + Verification rails (other routes)
  const executiveBriefItem = routeItems.find((item) =>
    item.path.includes('/brief'),
  );
  const otherRoutes = routeItems.filter(
    (item) => !item.path.includes('/brief'),
  );
  const routes = (
    <section id="routes" className="section-shell">
      <Container className="section-shell">
        {/* Executive Brief - dominant entry point */}
        {executiveBriefItem ? (
          <div className="mb-6">
            <Link
              href={`/${locale}/brief`}
              className={`${focusRingClass} block rounded-lg border-2 border-accent bg-surface-elevated p-6 transition-all motion-reduce:transition-none hover:border-accent-strong hover:shadow-lg`}
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="text-accent font-bold text-xl shrink-0 mt-0.5"
                >
                  →
                </span>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-text mb-2">
                    {executiveBriefItem.title}
                  </h2>
                  <p className="text-base text-muted leading-relaxed">
                    {executiveBriefItem.description}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ) : null}
        {/* Verification rails - other routes */}
        {otherRoutes.length > 0 ? (
          <VerificationRailsSection
            title={t('routes.title')}
            items={otherRoutes.map((item) => ({
              title: item.title,
              description: item.description,
              href: `/${locale}${item.path}`,
            }))}
          />
        ) : null}
      </Container>
    </section>
  );

  const byId: Partial<Record<SectionId, ReactNode>> = {
    hero,
    claims,
    doctrine,
    routes,
  };

  return (
    <>
      <WebSiteJsonLd locale={locale} />
      <PersonJsonLd />
      <div className="content-lane content-lane-grid">
        {HOME_IA_ORDER.filter((id) => HOME_SECTION_IDS.includes(id)).map(
          (id) => {
            const node = byId[id];
            return node != null ? <Fragment key={id}>{node}</Fragment> : null;
          },
        )}
      </div>
    </>
  );
}
