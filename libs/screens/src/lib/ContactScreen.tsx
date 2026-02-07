import { useTranslations } from 'next-intl';

import { PageScreen } from './PageScreen';

export function ContactScreen() {
  const t = useTranslations('routes');

  return (
    <PageScreen
      title={t('screens.contact.title')}
      body={t('screens.contact.lede')}
    />
  );
}
