import { QuietScreen, createQuietMetadata } from './QuietScreen';

export async function generateMetadata() {
  return createQuietMetadata('now');
}

export const nowMetadata = generateMetadata;

export async function NowScreen() {
  return <QuietScreen pageKey="now" />;
}
