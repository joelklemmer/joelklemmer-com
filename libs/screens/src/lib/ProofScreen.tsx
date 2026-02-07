import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function ProofScreen() {
  const t = useTranslations('routes');

  return (
    <PageScreen
      title={t('screens.proof.title')}
      body={t('screens.proof.lede')}
    />
  );
}
