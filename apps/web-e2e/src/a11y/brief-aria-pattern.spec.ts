/**
 * Regression guard for aria-required-children: elements with roles that require
 * specific children (list, menu, tablist, tree, grid) must have valid descendants.
 * Deterministic DOM checks; no axe in this spec so it stays fast and stable.
 */
import { test } from '@playwright/test';

const ROLES_REQUIRING_CHILDREN = [
  'list',
  'menu',
  'tablist',
  'tree',
  'grid',
] as const;

const VALID_CHILD_ROLES: Record<
  (typeof ROLES_REQUIRING_CHILDREN)[number],
  string[]
> = {
  list: ['listitem'],
  menu: ['menuitem', 'menuitemcheckbox', 'menuitemradio'],
  tablist: ['tab'],
  tree: ['treeitem', 'group'],
  grid: ['row'],
};

test('brief page has no aria-required-children violations', async ({
  page,
}) => {
  await page.goto('/en/brief', { waitUntil: 'load', timeout: 20000 });

  for (const role of ROLES_REQUIRING_CHILDREN) {
    const parents = await page.locator(`[role="${role}"]`).all();
    const allowedChildren = VALID_CHILD_ROLES[role];

    for (let i = 0; i < parents.length; i++) {
      const parent = parents[i];
      const childRoles = await parent
        .evaluate((el) => {
          const direct = Array.from(el.children);
          return direct.map(
            (c) =>
              c.getAttribute?.('role') ??
              (c.tagName === 'LI'
                ? 'listitem'
                : c.tagName === 'A' && el.getAttribute('role') === 'menu'
                  ? 'menuitem'
                  : null),
          );
        })
        .then((roles) => roles.filter(Boolean) as string[]);

      const hasValidChild = childRoles.some((r) => allowedChildren.includes(r));
      const hasValidDescendant = await parent.evaluate(
        (el, { allowed }) => {
          const all = el.querySelectorAll('[role]');
          for (let j = 0; j < all.length; j++) {
            const r = all[j].getAttribute('role');
            if (r && allowed.includes(r)) return true;
          }
          const listitems = el.querySelectorAll('li');
          if (allowed.includes('listitem') && listitems.length > 0) return true;
          return false;
        },
        { allowed: allowedChildren },
      );

      if (!hasValidChild && !hasValidDescendant) {
        const snippet = await parent.evaluate((el) =>
          el.outerHTML.slice(0, 300),
        );
        throw new Error(
          `aria-required-children: [role="${role}"] has no valid descendant (allowed: ${allowedChildren.join(', ')}). Snippet: ${snippet}`,
        );
      }
    }
  }
});
