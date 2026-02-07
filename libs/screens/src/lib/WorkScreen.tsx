import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function WorkScreen() {
  const t = useTranslations('routes.work');

  return <PageScreen title={t('title')} body={t('body')} />;
}
