import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function HomeScreen() {
  const t = useTranslations('routes.home');

  return <PageScreen title={t('title')} body={t('body')} />;
}
