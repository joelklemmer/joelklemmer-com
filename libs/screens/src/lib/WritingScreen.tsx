import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function WritingScreen() {
  const t = useTranslations('routes.writing');

  return <PageScreen title={t('title')} body={t('body')} />;
}
