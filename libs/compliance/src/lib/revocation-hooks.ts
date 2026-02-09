/**
 * Revocation hooks: preference changes and model participation flags.
 * Callbacks registered here run on withdraw or when model participation is turned off.
 */

export type RevocationHook = () => void | Promise<void>;

const hooks: RevocationHook[] = [];

export function registerRevocationHook(hook: RevocationHook): () => void {
  hooks.push(hook);
  return () => {
    const i = hooks.indexOf(hook);
    if (i !== -1) hooks.splice(i, 1);
  };
}

export async function runRevocationHooks(): Promise<void> {
  for (const hook of hooks) {
    try {
      await Promise.resolve(hook());
    } catch {
      // log but do not throw
    }
  }
}
