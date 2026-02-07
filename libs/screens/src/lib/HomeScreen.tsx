import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function HomeScreen() {
  const t = useTranslations('routes');

  return (
    <PageScreen title={t('screens.home.title')} body={t('screens.home.lede')} />
  );
}
