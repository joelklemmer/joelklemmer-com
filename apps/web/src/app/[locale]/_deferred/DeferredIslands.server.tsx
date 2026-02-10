/**
 * Server component: injects the deferred islands script (afterInteractive).
 * Optional bootstrap: expose initial consent for telemetry so islands.js can load analytics when allowed.
 */
import Script from 'next/script';

export interface DeferredIslandsBootstrapProps {
  /** When true, islands.js may load TelemetryLayer after idle. */
  initialAnalyticsConsent?: boolean;
}

export function DeferredIslandsScript({
  initialAnalyticsConsent = false,
}: DeferredIslandsBootstrapProps) {
  const bootstrap = `window.__INITIAL_ANALYTICS_CONSENT__=${JSON.stringify(initialAnalyticsConsent)};`;
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: bootstrap }}
        data-deferred-bootstrap
      />
      <Script
        strategy="afterInteractive"
        src="/deferred/islands.js"
        data-deferred-islands
      />
    </>
  );
}
