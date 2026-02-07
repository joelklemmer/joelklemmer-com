import { Box } from '@ui';
import { useTranslations } from 'next-intl';

export function WelcomeSection() {
  const t = useTranslations('routes');

  return (
    <Box id="welcome">
      <h1>{t('screens.home.title')}</h1>
      <p>{t('screens.home.lede')}</p>
    </Box>
  );
}
