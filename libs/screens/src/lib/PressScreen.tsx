import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function PressScreen() {
  const t = useTranslations('routes');

  return (
    <PageScreen
      title={t('screens.press.title')}
      body={t('screens.press.lede')}
    />
  );
}
