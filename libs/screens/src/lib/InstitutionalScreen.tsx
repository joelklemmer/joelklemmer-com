import type { ReactNode } from 'react';
import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { Container } from '@joelklemmer/ui';
import { HeroSection, MdxSection } from '@joelklemmer/sections';
import type { InstitutionalPageFrontmatter } from '@joelklemmer/content';

export type InstitutionalPageKey =
  | 'privacy'
  | 'terms'
  | 'accessibility'
  | 'security';

export interface InstitutionalScreenProps {
  pageKey: InstitutionalPageKey;
  frontmatter: InstitutionalPageFrontmatter;
  content: ReactNode;
  notice?: ReactNode;
}

export async function InstitutionalScreen({
  pageKey,
  frontmatter,
  content,
  notice,
}: InstitutionalScreenProps) {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['institutional']);
  const t = createScopedTranslator(locale, messages, 'institutional');
  const title = t(`${pageKey}.title`);
  const lede = t(`${pageKey}.lede`);

  return (
    <>
      {notice}
      <HeroSection title={title} lede={lede} />
      <section className="section-shell" aria-labelledby="governance-heading">
        <Container className="section-shell">
          <h2 id="governance-heading" className="sr-only">
            {t('governance.heading')}
          </h2>
          <dl className="grid gap-3 border-b border-border pb-6 text-sm md:grid-cols-2">
            <div>
              <dt className="font-medium text-text">
                {t('governance.version')}
              </dt>
              <dd className="text-muted">{frontmatter.version}</dd>
            </div>
            <div>
              <dt className="font-medium text-text">
                {t('governance.effectiveDate')}
              </dt>
              <dd className="text-muted">{frontmatter.effectiveDate}</dd>
            </div>
            <div>
              <dt className="font-medium text-text">
                {t('governance.lastReviewedDate')}
              </dt>
              <dd className="text-muted">{frontmatter.lastReviewedDate}</dd>
            </div>
            <div>
              <dt className="font-medium text-text">
                {t('governance.nextReviewDate')}
              </dt>
              <dd className="text-muted">{frontmatter.nextReviewDate}</dd>
            </div>
            <div>
              <dt className="font-medium text-text">{t('governance.owner')}</dt>
              <dd className="text-muted">{frontmatter.owner}</dd>
            </div>
            <div>
              <dt className="font-medium text-text">
                {t('governance.jurisdiction')}
              </dt>
              <dd className="text-muted">{frontmatter.jurisdiction}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="font-medium text-text">{t('governance.scope')}</dt>
              <dd className="text-muted">{frontmatter.scope}</dd>
            </div>
          </dl>
        </Container>
      </section>
      {content ? <MdxSection>{content}</MdxSection> : null}
    </>
  );
}
