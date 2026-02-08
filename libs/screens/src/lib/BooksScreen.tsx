import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getBookList } from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import {
  CardGridSection,
  HeroSection,
  ListSection,
  SectionVisualAnchor,
} from '@joelklemmer/sections';
import { DensityAwarePage } from '@joelklemmer/authority-density';

export async function generateMetadata() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['meta']);
  const t = createScopedTranslator(locale, messages, 'meta');
  return createPageMetadata({
    title: t('books.title'),
    description: t('books.description'),
    locale,
    pathname: '/books',
  });
}

export const booksMetadata = generateMetadata;

export async function BooksScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['books', 'common']);
  const t = createScopedTranslator(locale, messages, 'books');
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const books = await getBookList(locale);

  return (
    <>
      <HeroSection title={t('index.title')} lede={t('index.subtitle')} />
      <DensityAwarePage toggleLabel={tCommon('density.toggleLabel')}>
        <SectionVisualAnchor className="mb-6" />
        {books.length ? (
          <CardGridSection
            title={t('index.listTitle')}
            items={books.map((book) => ({
              title: book.frontmatter.title,
              description: book.frontmatter.summary,
              meta: [
                book.frontmatter.publicationDate,
                book.frontmatter.publisher,
                book.frontmatter.formats?.join(', '),
              ]
                .filter(Boolean)
                .join(' · '),
              href: `/${locale}/books/${book.frontmatter.slug}`,
            }))}
          />
        ) : (
          <ListSection
            title={t('index.listTitle')}
            items={[t('index.empty')]}
          />
        )}
      </DensityAwarePage>
    </>
  );
}
