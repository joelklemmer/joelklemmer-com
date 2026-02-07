import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function FaqScreen() {
  const t = useTranslations('routes');

  return (
    <PageScreen title={t('screens.faq.title')} body={t('screens.faq.lede')} />
  );
}
