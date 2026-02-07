import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function WorkScreen() {
  const t = useTranslations('routes');

  return (
    <PageScreen title={t('screens.work.title')} body={t('screens.work.lede')} />
  );
}
