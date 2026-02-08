'use server';

import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { resolveEvaluatorMode } from '@joelklemmer/evaluator-mode';
import { surfacePriorityMatrix } from '@joelklemmer/authority-orchestration';
import {
  populateRegistryFromConfig,
  getEntitySignalVector,
} from '@joelklemmer/authority-mapping';
import { getEntityGraph } from '@joelklemmer/intelligence';
import { buildSemanticIndex } from '@joelklemmer/intelligence';
import type { GraphNode } from '@joelklemmer/intelligence';
import {
  query,
  format,
  isAECQueryIntent,
  type AECFormattedResult,
} from '@joelklemmer/aec';

/**
 * AEC briefing query: deterministic retrieval from entity graph + semantic index.
 * No LLM; no hallucination. Returns structured briefing and entity links.
 */
export async function queryBriefingAction(
  _formData: FormData,
): Promise<AECFormattedResult> {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['brief', 'frameworks']);
  const t = createScopedTranslator(locale, messages, 'brief');
  const tFw = createScopedTranslator(locale, messages, 'frameworks');

  const cookieStore = await cookies();
  const evaluatorMode = resolveEvaluatorMode({
    cookies: cookieStore.toString(),
    isDev: process.env.NODE_ENV !== 'production',
  });

  const intentRaw = _formData.get('intent');
  const intent =
    typeof intentRaw === 'string' && isAECQueryIntent(intentRaw)
      ? intentRaw
      : 'explore_domain';

  populateRegistryFromConfig();
  const entityGraph = await getEntityGraph(undefined, {
    getSignalVector: (kind, id) =>
      getEntitySignalVector(
        kind as 'claim' | 'record' | 'caseStudy' | 'book' | 'framework',
        id,
        evaluatorMode,
      ),
  });
  const semanticIndex = await buildSemanticIndex(locale, {
    getSignalVector: (kind, id) =>
      getEntitySignalVector(
        kind as 'claim' | 'record' | 'caseStudy' | 'book' | 'framework',
        id,
        evaluatorMode,
      ),
  });

  const result = query(entityGraph, semanticIndex, intent, {
    evaluatorMode,
    maxPerType: 10,
  });

  const labelResolver = (node: GraphNode): string => {
    if (node.kind === 'claim') return t(node.labelKey);
    if (node.kind === 'framework') return tFw(node.titleKey);
    if (
      'title' in node &&
      typeof (node as { title: string }).title === 'string'
    )
      return (node as { title: string }).title;
    return node.id;
  };

  const priorityWeights = surfacePriorityMatrix[evaluatorMode];

  return format(result, {
    labelResolver,
    basePath: `/${locale}`,
    priorityWeights,
  });
}
