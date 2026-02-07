import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function BioScreen() {
  const t = useTranslations('routes.bio');

  return <PageScreen title={t('title')} body={t('body')} />;
}
