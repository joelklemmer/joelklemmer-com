import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function ContactScreen() {
  const t = useTranslations('routes.contact');

  return <PageScreen title={t('title')} body={t('body')} />;
}
