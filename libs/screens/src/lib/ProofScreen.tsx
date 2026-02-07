import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function ProofScreen() {
  const t = useTranslations('routes.proof');

  return <PageScreen title={t('title')} body={t('body')} />;
}
