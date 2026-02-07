import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function BriefScreen() {
  const t = useTranslations('routes.brief');

  return <PageScreen title={t('title')} body={t('body')} />;
}
