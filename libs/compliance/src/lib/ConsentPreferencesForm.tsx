'use client';

import { useCallback, useEffect, useState } from 'react';
import { focusRingClass } from '@joelklemmer/a11y';
import type { ConsentState } from './consent-state-v2';
import { useConsentV2 } from './ConsentContextV2';
import type { ConsentCategory, PurposeScope } from './categories';
import { CONSENT_CATEGORIES, PURPOSE_SCOPES } from './categories';
import { isEssentialCategory } from './categories';

const NON_ESSENTIAL_CATEGORIES = CONSENT_CATEGORIES.filter(
  (c) => !isEssentialCategory(c),
);

export interface ConsentFormLabels {
  intro: string;
  categories: string;
  purposes: string;
  functional: string;
  analytics: string;
  experience: string;
  marketing: string;
  measurement: string;
  experimentation: string;
  personalization: string;
  security: string;
  fraud: string;
  recommendation: string;
  profiling: string;
  modelParticipation: string;
  save: string;
  withdraw: string;
}

export interface ConsentPreferencesFormProps {
  labels: ConsentFormLabels;
}

export function ConsentPreferencesForm({
  labels,
}: ConsentPreferencesFormProps) {
  const { consentState, updateConsent, withdraw } = useConsentV2();

  const [categories, setCategories] = useState<Record<string, boolean>>(
    consentState.categories,
  );
  const [purposes, setPurposes] = useState<Record<string, boolean>>(
    consentState.purposes,
  );
  const [modelParticipation, setModelParticipation] = useState(
    consentState.modelParticipation,
  );

  useEffect(() => {
    setCategories(consentState.categories);
    setPurposes(consentState.purposes);
    setModelParticipation(consentState.modelParticipation);
  }, [
    consentState.categories,
    consentState.purposes,
    consentState.modelParticipation,
  ]);

  const handleCategoryChange = useCallback(
    (cat: ConsentCategory, value: boolean) => {
      setCategories((prev) => ({ ...prev, [cat]: value }));
    },
    [],
  );

  const handlePurposeChange = useCallback(
    (purpose: PurposeScope, value: boolean) => {
      setPurposes((prev) => ({ ...prev, [purpose]: value }));
    },
    [],
  );

  const handleSave = useCallback(() => {
    const next: ConsentState = {
      ...consentState,
      timestamp: Date.now(),
      choiceMade: true,
      categories: { ...consentState.categories, ...categories },
      purposes: { ...consentState.purposes, ...purposes },
      modelParticipation,
    };
    updateConsent(next);
  }, [consentState, categories, purposes, modelParticipation, updateConsent]);

  const handleWithdraw = useCallback(() => {
    withdraw();
  }, [withdraw]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      className="space-y-8"
    >
      <p className="text-muted text-sm">{labels.intro}</p>

      <fieldset className="space-y-3" aria-labelledby="categories-legend">
        <legend
          id="categories-legend"
          className="text-sm font-semibold text-text"
        >
          {labels.categories}
        </legend>
        {NON_ESSENTIAL_CATEGORIES.map((cat) => (
          <label key={cat} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={categories[cat] ?? false}
              onChange={(e) => handleCategoryChange(cat, e.target.checked)}
              className={focusRingClass}
              aria-describedby={cat === 'essential' ? undefined : `${cat}-desc`}
            />
            <span className="text-sm font-medium text-text">
              {labels[cat as keyof ConsentFormLabels]}
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-3" aria-labelledby="purposes-legend">
        <legend
          id="purposes-legend"
          className="text-sm font-semibold text-text"
        >
          {labels.purposes}
        </legend>
        {PURPOSE_SCOPES.map((p) => (
          <label key={p} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={purposes[p] ?? false}
              onChange={(e) => handlePurposeChange(p, e.target.checked)}
              className={focusRingClass}
            />
            <span className="text-sm font-medium text-text">
              {labels[p as keyof ConsentFormLabels]}
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-2" aria-labelledby="model-legend">
        <legend id="model-legend" className="sr-only">
          {labels.modelParticipation}
        </legend>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={modelParticipation}
            onChange={(e) => setModelParticipation(e.target.checked)}
            className={focusRingClass}
          />
          <span className="text-sm font-medium text-text">
            {labels.modelParticipation}
          </span>
        </label>
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className={`${focusRingClass} rounded-none bg-text px-3 py-2 text-sm text-bg hover:opacity-90`}
        >
          {labels.save}
        </button>
        <button
          type="button"
          onClick={handleWithdraw}
          className={`${focusRingClass} rounded-none border border-border px-3 py-2 text-sm text-muted hover:text-text`}
        >
          {labels.withdraw}
        </button>
      </div>
    </form>
  );
}
