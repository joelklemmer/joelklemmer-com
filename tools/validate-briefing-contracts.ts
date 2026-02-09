/**
 * Validates briefing-mode contracts: deterministic builders produce valid shapes
 * and WhatMattersSummary.source is 'deterministic'. No AI; contract assertions only.
 */
import {
  buildClaimProofMap,
  buildWhatMattersSummary,
  buildBriefingPanelContext,
  DETERMINISTIC_BRIEFING_PROVIDER_ID,
} from '@joelklemmer/content/validate';

const errors: string[] = [];

// Empty input
const emptyMap = buildClaimProofMap([]);
if (emptyMap.entries.length !== 0) {
  errors.push('buildClaimProofMap([]) should have 0 entries');
}
if (emptyMap.totalProofCount !== 0) {
  errors.push('buildClaimProofMap([]) totalProofCount should be 0');
}

const emptyWhatMatters = buildWhatMattersSummary(emptyMap.entries, {
  maxItems: 6,
});
if (emptyWhatMatters.source !== 'deterministic') {
  errors.push(
    `buildWhatMattersSummary source must be 'deterministic', got ${emptyWhatMatters.source}`,
  );
}
if (emptyWhatMatters.items.length !== 0) {
  errors.push('buildWhatMattersSummary([]) should have 0 items');
}

// Single claim, one proof
const singleInput = [
  {
    claimId: 'test-claim',
    claimLabel: 'Test claim',
    claimSummary: 'Summary',
    categoryId: 'evidence_verification' as const,
    proofLinks: [{ id: 'p1', label: 'Proof 1', href: '/proof/1' }],
    caseStudyCount: 0,
    lastVerified: '2025-01-01',
  },
];
const singleMap = buildClaimProofMap(singleInput);
if (singleMap.entries.length !== 1) {
  errors.push(
    `buildClaimProofMap(single) expected 1 entry, got ${singleMap.entries.length}`,
  );
}
if (singleMap.totalProofCount !== 1) {
  errors.push(
    `buildClaimProofMap(single) totalProofCount expected 1, got ${singleMap.totalProofCount}`,
  );
}

const singleWhatMatters = buildWhatMattersSummary(singleMap.entries, {
  maxItems: 6,
});
if (singleWhatMatters.items.length !== 1) {
  errors.push(
    `buildWhatMattersSummary(single) expected 1 item, got ${singleWhatMatters.items.length}`,
  );
}
if (singleWhatMatters.items[0].refId !== 'test-claim') {
  errors.push(
    `buildWhatMattersSummary item refId expected 'test-claim', got ${singleWhatMatters.items[0].refId}`,
  );
}

// Panel context
const panel = buildBriefingPanelContext('Scope.', [
  { label: 'Claims', href: '/brief#claims' },
]);
if (panel.scopeSummary !== 'Scope.') {
  errors.push(
    `buildBriefingPanelContext scopeSummary mismatch: ${panel.scopeSummary}`,
  );
}
if (
  panel.readPathLinks.length !== 1 ||
  panel.readPathLinks[0].label !== 'Claims'
) {
  errors.push('buildBriefingPanelContext readPathLinks mismatch');
}

// Constant
if (DETERMINISTIC_BRIEFING_PROVIDER_ID !== 'deterministic') {
  errors.push(
    `DETERMINISTIC_BRIEFING_PROVIDER_ID expected 'deterministic', got ${DETERMINISTIC_BRIEFING_PROVIDER_ID}`,
  );
}

if (errors.length > 0) {
  console.error('Briefing contracts validation failed:');
  errors.forEach((e) => console.error('  -', e));
  process.exit(1);
}

console.log('Briefing contracts validation passed.');
