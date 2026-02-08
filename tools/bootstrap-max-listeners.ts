/**
 * Run before any other imports in validator scripts so that process listener limits
 * are raised before dependencies (e.g. @joelklemmer/content/validate, tsx) register
 * exit/SIGINT/SIGTERM listeners. Prevents MaxListenersExceededWarning during nx verify.
 */
if (
  typeof process !== 'undefined' &&
  typeof process.setMaxListeners === 'function'
) {
  process.setMaxListeners(30);
}
