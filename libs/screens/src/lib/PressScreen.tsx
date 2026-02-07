import { getLocale } from 'next-intl/server';
import { type AppLocale } from '@joelklemmer/i18n';
import { getPressKit, renderMdx } from '@joelklemmer/content';
import { QuietScreen, createQuietMetadata } from './QuietScreen';

export async function generateMetadata() {
  return createQuietMetadata('press');
}

export const pressMetadata = generateMetadata;

export async function PressScreen() {
  const locale = (await getLocale()) as AppLocale;
  const entry = await getPressKit(locale);
  const content = entry ? await renderMdx(entry.content) : null;

  return <QuietScreen pageKey="press" content={content} />;
}
