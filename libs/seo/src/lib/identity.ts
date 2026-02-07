import { z } from 'zod';

const sameAsSchema = z.array(z.string().url());
let warned = false;

function warnOnce(message: string) {
  if (!warned) {
    console.warn(message);
    warned = true;
  }
}

export function getIdentitySameAs() {
  const raw = process.env.NEXT_PUBLIC_IDENTITY_SAME_AS ?? '';
  const values = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const parsed = sameAsSchema.safeParse(values);
  const isProduction = process.env.NODE_ENV === 'production';

  if (!values.length || !parsed.success) {
    if (isProduction) {
      const details = parsed.success
        ? 'sameAs is empty'
        : parsed.error.issues.map((issue) => issue.message).join('; ');
      throw new Error(`Invalid NEXT_PUBLIC_IDENTITY_SAME_AS: ${details}`);
    }
    warnOnce(
      'NEXT_PUBLIC_IDENTITY_SAME_AS is empty or invalid; JSON-LD will omit sameAs.',
    );
    return [];
  }

  return parsed.data;
}
