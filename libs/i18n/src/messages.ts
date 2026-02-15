import { createTranslator } from 'next-intl';
import type { AppLocale } from './locales';

export const messageNamespaces = [
  'common',
  'nav',
  'footer',
  'meta',
  'seo',
  'home',
  'brief',
  'work',
  'operatingSystem',
  'writing',
  'books',
  'contact',
  'proof',
  'publicRecord',
  'quiet',
  'institutional',
  'frameworks',
  'consent',
] as const;

export type MessageNamespace = (typeof messageNamespaces)[number];

export async function loadMessages(
  locale: AppLocale,
  namespaces: readonly MessageNamespace[],
) {
  const imports = await Promise.all(
    namespaces.map(
      (namespace) => import(`./messages/${locale}/${namespace}.json`),
    ),
  );

  return Object.fromEntries(
    namespaces.map((namespace, index) => [
      namespace,
      imports[index]?.default ?? {},
    ]),
  ) as Record<MessageNamespace, Record<string, unknown>>;
}

export function mergeMessages(
  ...messageSets: Array<Record<string, Record<string, unknown>>>
) {
  return messageSets.reduce(
    (acc, messages) => ({
      ...acc,
      ...messages,
    }),
    {},
  );
}

export function createScopedTranslator(
  locale: AppLocale,
  messages: Record<string, Record<string, unknown>>,
  namespace: string,
) {
  return createTranslator({
    locale,
    messages: messages as Record<string, string | Record<string, unknown>>,
    namespace,
  });
}
