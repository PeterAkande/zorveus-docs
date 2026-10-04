import path from 'node:path';

/** @typedef {{ url: string, title: string, description?: string }} Document */

/** Resolve only published document paths. Reject file-system paths from callers. */
export function resolveDocumentPath(slug, pages, directory) {
  if (slug !== '' && !/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(slug)) return null;
  const url = slug ? `/${slug}` : '/';
  if (!pages.some((page) => page.url === url)) return null;
  return path.join(directory, slug ? `${slug}.mdx` : 'index.mdx');
}

/** Build the agent index from the same page metadata as the website. */
export function buildLlmsIndex(pages) {
  const base = 'https://docs.zorveus.com';
  const lines = [
    '# Zorveus documentation',
    '',
    '> Zorveus is an AI inference gateway with product-user allowances, credits, and wallet billing.',
    '',
    'Choose the funding path first: organization-funded products use inference keys; user-funded apps use OAuth.',
    'Use an inference key for model requests and a service key for product-user management. Keep keys server-side.',
    'OpenAI base URL: https://api.zorveus.com/v1. Anthropic base URL: https://api.zorveus.com.',
    'Management base URL: https://api.zorveus.com. Model catalog: https://www.zorveus.com/models.',
    '',
    'Start with /getting-started/integrate-your-product for organization-funded integration.',
    'Read /startups/check-allowance before adding admission checks. Credits alone are not total available allowance.',
    '',
    'The links below return source Markdown with MDX components. Code fences include every SDK tab.',
    'The corresponding HTML page URL appears after each link.',
  ];
  let category = '';
  for (const page of [...pages].sort((a, b) => a.url.localeCompare(b.url))) {
    const slug = page.url.slice(1);
    const nextCategory = slug.includes('/') ? slug.split('/')[0] : 'overview';
    if (nextCategory !== category) {
      category = nextCategory;
      const label = category === 'startups' ? 'Business' : category.replaceAll('-', ' ');
      lines.push('', `## ${label}`, '');
    }
    lines.push(`- [${page.title}](${base}/api/raw-doc?slug=${encodeURIComponent(slug)}): ${page.description ?? ''} HTML: ${base}${page.url}`);
  }
  return `${lines.join('\n')}\n`;
}
