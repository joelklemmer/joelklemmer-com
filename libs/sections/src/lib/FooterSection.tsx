import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { Box } from '@ui';

const footerLinks = ['press', 'proof', 'bio', 'faq', 'now'] as const;

export function FooterSection() {
  const locale = useLocale();
  const t = useTranslations('footer');

  return (
    <Box className="footer">
      <nav aria-label={t('label')}>
        <ul className="quiet-links">
          {footerLinks.map((slug) => (
            <li key={slug}>
              <Link href={`/${locale}/${slug}`}>{t(`links.${slug}`)}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </Box>
  );
}
