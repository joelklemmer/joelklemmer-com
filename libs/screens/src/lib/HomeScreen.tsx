import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { createPageMetadata, PersonJsonLd } from '@joelklemmer/seo';
import {
  CardGridSection,
  FrameworkCard,
  HeroSection,
  ListSection,
  StartHereSection,
} from '@joelklemmer/sections';
import { Container } from '@joelklemmer/ui';
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
  });
}

export const homeMetadata = generateMetadata;

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

  return (
    <>
      <PersonJsonLd />
      <HeroSection
        title={t('hero.title')}
        lede={t('hero.lede')}
        actions={[{ label: t('hero.cta'), href: `/${locale}/brief` }]}
      />
      <StartHereSection
        sentence={t('startHere.sentence')}
        linkLabel={t('startHere.linkLabel')}
        href={`/${locale}/brief`}
      />
      <ListSection title={t('claims.title')} items={claimItems} />
      {frameworks.length > 0 ? (
        <section id="doctrine" className="section-shell">
          <Container className="section-shell">
            <div className="section-shell">
              <h2 className="text-title font-semibold">
                {tFw('section.title')}
              </h2>
              <p className="text-base text-muted">{tFw('section.lede')}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3 mt-4">
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
      ) : null}
      <CardGridSection
        title={t('routes.title')}
        items={routeItems.map((item) => ({
          title: item.title,
          description: item.description,
          href: `/${locale}${item.path}`,
        }))}
      />
    </>
  );
}
