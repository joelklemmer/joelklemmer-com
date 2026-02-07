import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function NowScreen() {
  const t = useTranslations('routes');

  return (
    <PageScreen title={t('screens.now.title')} body={t('screens.now.lede')} />
  );
}
