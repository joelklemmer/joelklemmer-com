import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function FaqScreen() {
  const t = useTranslations('routes.faq');

  return <PageScreen title={t('title')} body={t('body')} />;
}
