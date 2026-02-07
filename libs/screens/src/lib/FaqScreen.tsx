import { QuietScreen, createQuietMetadata } from './QuietScreen';

export async function generateMetadata() {
  return createQuietMetadata('faq');
}

export const faqMetadata = generateMetadata;

export async function FaqScreen() {
  return <QuietScreen pageKey="faq" />;
}
