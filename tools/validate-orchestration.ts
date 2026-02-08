/**
 * Orchestration validation: matrices defined for all evaluator modes,
 * no empty priority sets, hints non-destructive.
 * Additive verify stage: run after aec-validate.
 */

import {
  EVALUATOR_MODES_LIST,
  surfacePriorityMatrix,
  signalAmplificationMatrix,
  densityDefaultMatrix,
  computeOrchestrationHints,
  SURFACE_ENTITY_KINDS,
  type SurfacePriorityWeights,
} from '@joelklemmer/authority-orchestration';
import type { EvaluatorMode } from '@joelklemmer/evaluator-mode';

const errors: string[] = [];

for (const mode of EVALUATOR_MODES_LIST) {
  const priority = surfacePriorityMatrix[mode as EvaluatorMode];
  if (!priority) {
    errors.push(
      `surfacePriorityMatrix missing entry for evaluator mode: ${mode}`,
    );
    continue;
  }
  for (const kind of SURFACE_ENTITY_KINDS) {
    const v = priority[kind];
    if (typeof v !== 'number' || v < 0 || v > 1) {
      errors.push(
        `surfacePriorityMatrix[${mode}].${kind} must be a number in [0,1]; got ${v}`,
      );
    }
  }
  const sum = SURFACE_ENTITY_KINDS.reduce((s, k) => s + (priority[k] ?? 0), 0);
  if (sum === 0) {
    errors.push(
      `surfacePriorityMatrix[${mode}] has empty priority set (sum=0).`,
    );
  }
}

for (const mode of EVALUATOR_MODES_LIST) {
  const amp = signalAmplificationMatrix[mode as EvaluatorMode];
  if (!amp) {
    errors.push(
      `signalAmplificationMatrix missing entry for evaluator mode: ${mode}`,
    );
  } else {
    for (const kind of SURFACE_ENTITY_KINDS) {
      const v = amp[kind];
      if (typeof v !== 'number' || v < 0) {
        errors.push(
          `signalAmplificationMatrix[${mode}].${kind} must be a non-negative number; got ${v}`,
        );
      }
    }
  }
}

for (const mode of EVALUATOR_MODES_LIST) {
  const density = densityDefaultMatrix[mode as EvaluatorMode];
  if (typeof density !== 'boolean') {
    errors.push(
      `densityDefaultMatrix[${mode}] must be boolean; got ${typeof density}`,
    );
  }
}

const hints = computeOrchestrationHints({
  evaluatorMode: 'default',
  sectionIds: ['hero', 'claims', 'doctrine'],
});
if (!Array.isArray(hints.sectionOrderingHint)) {
  errors.push('Orchestration hints sectionOrderingHint must be an array.');
} else if (hints.sectionOrderingHint.length === 0) {
  errors.push(
    'Orchestration hints sectionOrderingHint must not be empty when sectionIds provided.',
  );
}
const sectionSet = new Set(hints.sectionOrderingHint);
const requestedSet = new Set(['hero', 'claims', 'doctrine']);
for (const id of requestedSet) {
  if (!sectionSet.has(id)) {
    errors.push(
      `Orchestration hints must be non-destructive: requested section "${id}" missing from sectionOrderingHint.`,
    );
  }
}
if (sectionSet.size !== requestedSet.size) {
  errors.push(
    `Orchestration hints must be non-destructive: sectionOrderingHint length (${sectionSet.size}) must equal requested sectionIds length (${requestedSet.size}).`,
  );
} else {
  for (const id of sectionSet) {
    if (!requestedSet.has(id)) {
      errors.push(
        `Orchestration hints must be non-destructive: sectionOrderingHint contains "${id}" which was not in requested sectionIds.`,
      );
    }
  }
}
if (typeof hints.densityDefaultSuggestion !== 'boolean') {
  errors.push('Orchestration hints densityDefaultSuggestion must be boolean.');
}
if (
  typeof hints.priorityWeights !== 'object' ||
  hints.priorityWeights === null
) {
  errors.push('Orchestration hints priorityWeights must be an object.');
} else {
  const pw = hints.priorityWeights as SurfacePriorityWeights;
  for (const kind of SURFACE_ENTITY_KINDS) {
    if (typeof pw[kind] !== 'number') {
      errors.push(
        `Orchestration hints priorityWeights.${kind} must be a number.`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error(
    'Orchestration validation failed:\n' +
      errors.map((e) => `  ${e}`).join('\n'),
  );
  process.exit(1);
}

console.info(
  '[Orchestration] Validation passed: all evaluator modes have matrices, no empty priority sets, hints non-destructive.',
);
