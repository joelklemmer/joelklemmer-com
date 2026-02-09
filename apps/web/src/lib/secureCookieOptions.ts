/**
 * Secure cookie options for enterprise policy.
 * Use when setting cookies via Next.js cookies().set() or equivalent.
 *
 * Policy: secure, sameSite, httpOnly (for session/sensitive cookies).
 * For session cookies, set maxAge or expires appropriately.
 * @see docs/security/COOKIE-AUDIT.md
 */

/** Options for cookies that must not be readable by JavaScript (e.g. session). */
export const SECURE_HTTPONLY_COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  httpOnly: true,
};

/** Options for cookies that may be read by client script (e.g. preferences). */
export const SECURE_COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  httpOnly: false,
};
