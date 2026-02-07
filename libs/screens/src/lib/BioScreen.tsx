import { QuietScreen, createQuietMetadata } from './QuietScreen';

export async function generateMetadata() {
  return createQuietMetadata('bio');
}

export const bioMetadata = generateMetadata;

export async function BioScreen() {
  return <QuietScreen pageKey="bio" />;
}
