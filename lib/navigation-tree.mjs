/**
 * Top-level navigation grouping for the Zorveus docs notebook header tabs.
 * Keeps existing MDX file routes intact while splitting Code Labs, CLI, and
 * API Reference into dedicated tabs with scoped left sidebars.
 */

const TAB_SECTIONS = [
  { prefix: 'code-labs', id: 'tab-code-labs', name: 'Code Labs' },
  { prefix: 'cli', id: 'tab-cli', name: 'CLI' },
  { prefix: 'api-reference', id: 'tab-api-reference', name: 'API Reference' },
];

/**
 * Check whether a root page-tree folder belongs to one of the top-level tab prefixes.
 * @param {any} node
 * @param {string} prefix
 * @returns {boolean}
 */
function folderMatchesPrefix(node, prefix) {
  if (!node || node.type !== 'folder') return false;
  if (node.$ref?.folder === prefix || node.$ref?.folder?.endsWith(`/${prefix}`)) return true;
  if (typeof node.index?.url === 'string' && node.index.url.startsWith(`/${prefix}`)) return true;
  if (Array.isArray(node.children)) {
    return node.children.some((child) => {
      if (child.type === 'page' && typeof child.url === 'string') {
        return child.url === `/${prefix}` || child.url.startsWith(`/${prefix}/`);
      }
      if (child.type === 'folder') {
        return folderMatchesPrefix(child, prefix);
      }
      return false;
    });
  }
  return false;
}

/**
 * Group top-level page tree folders into four navbar tabs without changing page URLs.
 * @template {{ $id?: string, name?: any, children: any[], fallback?: any }} TRoot
 * @param {TRoot} tree
 * @returns {TRoot}
 */
export function buildGroupedNavigationTree(tree) {
  if (!tree || !Array.isArray(tree.children)) return tree;

  /** @type {Map<string, any>} */
  const extracted = new Map();
  /** @type {any[]} */
  const docChildren = [];

  for (const node of tree.children) {
    const matchedSection = TAB_SECTIONS.find((section) => folderMatchesPrefix(node, section.prefix));
    if (matchedSection && !extracted.has(matchedSection.prefix)) {
      extracted.set(matchedSection.prefix, {
        ...node,
        $id: node.$id ?? matchedSection.id,
        name: matchedSection.name,
        root: true,
      });
      continue;
    }
    docChildren.push(node);
  }

  const tabs = [
    {
      type: 'folder',
      $id: 'tab-documentation',
      name: 'Documentation',
      root: true,
      children: docChildren,
    },
    ...TAB_SECTIONS.map((section) => extracted.get(section.prefix)).filter(Boolean),
  ];

  return {
    ...tree,
    $id: tree.$id ?? 'zorveus-docs-root',
    children: tabs,
  };
}

