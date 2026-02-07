import { Box } from '@ui';
import { useTranslations } from 'next-intl';

export function WelcomeSection() {
  const t = useTranslations('home');

  return (
    <Box id="welcome">
      <h1>
        <span>{t('welcomeLead')}</span>
        {t('welcomeTitle')}
      </h1>
    </Box>
  );
}
