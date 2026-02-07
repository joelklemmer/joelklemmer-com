import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function OperatingSystemScreen() {
  const t = useTranslations('routes.operating-system');

  return <PageScreen title={t('title')} body={t('body')} />;
}
