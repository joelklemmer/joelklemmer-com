import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function BioScreen() {
  const t = useTranslations('routes');

  return (
    <PageScreen title={t('screens.bio.title')} body={t('screens.bio.lede')} />
  );
}
