import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function NowScreen() {
  const t = useTranslations('routes.now');

  return <PageScreen title={t('title')} body={t('body')} />;
}
