'use client';

/**
 * Minimal client bridge: loads TelemetryLayer, ConsentActionsIsland, and
 * ShellDeferredControls via dynamic import (ssr: false) so they are not in
 * the root chunk. This is the only client module the locale layout may import.
 */
import dynamic from 'next/dynamic';
import type { ConsentStateV2 } from '@joelklemmer/compliance';

const TelemetryLayerDynamic = dynamic(
  () =>
    import('../../lib/DeferredTelemetry').then((m) => ({
      default: m.TelemetryLayer,
    })),
  { ssr: false },
);

const ConsentActionsIslandDynamic = dynamic(
  () =>
    import('@joelklemmer/compliance').then((m) => ({
      default: m.ConsentActionsIsland,
    })),
  { ssr: false },
);

const ShellDeferredControlsDynamic = dynamic<{
  initialEvaluatorMode?: string;
  locale: string;
  messages: Record<string, unknown>;
}>(
  () =>
    import('@joelklemmer/shell').then((m) => ({
      default: m.ShellDeferredControls,
    })),
  { ssr: false },
);

export function ClientDeferredBridge({
  initialAnalyticsConsent,
  initialConsentState,
  showConsentBanner,
}: {
  initialAnalyticsConsent: boolean;
  initialConsentState: ConsentStateV2 | null;
  showConsentBanner: boolean;
}) {
  return (
    <>
      <TelemetryLayerDynamic
        initialAnalyticsConsent={initialAnalyticsConsent}
        initialConsentState={initialConsentState}
      />
      {showConsentBanner ? <ConsentActionsIslandDynamic /> : null}
    </>
  );
}

export function ClientDeferredControlsSlot({
  initialEvaluatorMode,
  locale,
  messages,
}: {
  initialEvaluatorMode?: string;
  locale: string;
  messages: Record<string, unknown>;
}) {
  return (
    <ShellDeferredControlsDynamic
      initialEvaluatorMode={initialEvaluatorMode}
      locale={locale}
      messages={messages}
    />
  );
}
