import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function PressScreen() {
  const t = useTranslations('routes.press');

  return <PageScreen title={t('title')} body={t('body')} />;
}
