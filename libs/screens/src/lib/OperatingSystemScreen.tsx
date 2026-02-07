import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function OperatingSystemScreen() {
  const t = useTranslations('routes');

  return (
    <PageScreen
      title={t('screens.operating-system.title')}
      body={t('screens.operating-system.lede')}
    />
  );
}
