import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getWritingPosts } from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import {
  CardGridSection,
  HeroSection,
  ListSection,
} from '@joelklemmer/sections';

export async function generateMetadata() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['meta']);
  const t = createScopedTranslator(locale, messages, 'meta');
  return createPageMetadata({
    title: t('writing.title'),
    description: t('writing.description'),
    locale,
    pathname: '/writing',
  });
}

export const writingMetadata = generateMetadata;

export async function WritingScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['writing']);
  const t = createScopedTranslator(locale, messages, 'writing');
  const posts = await getWritingPosts(locale);

  return (
    <>
      <HeroSection title={t('hero.title')} lede={t('hero.lede')} />
      {posts.length ? (
        <CardGridSection
          title={t('list.title')}
          items={posts.map((post) => ({
            title: post.frontmatter.title,
            description: post.frontmatter.summary,
            meta: post.frontmatter.date,
            href: `/${locale}/writing/${post.frontmatter.slug}`,
          }))}
        />
      ) : (
        <ListSection title={t('list.title')} items={[t('list.empty')]} />
      )}
    </>
  );
}
