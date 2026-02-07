import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function WritingScreen() {
  const t = useTranslations('routes');

  return (
    <PageScreen
      title={t('screens.writing.title')}
      body={t('screens.writing.lede')}
    />
  );
}
