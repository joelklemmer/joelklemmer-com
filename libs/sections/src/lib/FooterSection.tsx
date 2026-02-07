import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { Box } from '@ui';

const footerLinks = ['press', 'proof', 'bio', 'faq', 'now'] as const;

export function FooterSection() {
  const locale = useLocale();
  const t = useTranslations('nav');

  return (
    <Box className="footer">
      <nav aria-label={t('quietLinks.label')}>
        <ul className="quiet-links">
          {footerLinks.map((slug) => (
            <li key={slug}>
              <Link href={`/${locale}/${slug}`}>{t(`quietLinks.${slug}`)}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </Box>
  );
}
