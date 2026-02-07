import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function BriefScreen() {
  const t = useTranslations('routes');

  return (
    <PageScreen
      title={t('screens.brief.title')}
      body={t('screens.brief.lede')}
    />
  );
}
