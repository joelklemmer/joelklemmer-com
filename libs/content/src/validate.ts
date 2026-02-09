/**
 * Validation-only entry point. Use this from tools/validate-content.ts to avoid
 * pulling in next-mdx-remote (content.ts), which has ESM-only deps that break
 * under tsx on Node 20 (e.g. estree-walker).
 */
export * from './lib/claims';
export * from './lib/briefing-contracts';
export * from './lib/contact';
export * from './lib/schemas';
export * from './lib/artifacts';
export * from './lib/media';
export * from './lib/proof-files';
export * from './lib/sitemap-data';
