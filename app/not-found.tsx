import { DocsPage } from 'fumadocs-ui/layouts/notebook/page';
import { ZorveusDocsLayout } from '@/components/layout/ZorveusDocsLayout';
import { DocsNotFound } from '@/components/layout/DocsNotFound';
import { buildGroupedNavigationTree } from '@/lib/navigation-tree.mjs';
import { source } from '@/lib/source';

export default function GlobalNotFound() {
  const tree = buildGroupedNavigationTree(source.pageTree);

  return (
    <ZorveusDocsLayout tree={tree}>
      <DocsPage
        full
        breadcrumb={{ enabled: false }}
        footer={{ enabled: false }}
        tableOfContent={{ enabled: false }}
        tableOfContentPopover={{ enabled: false }}
      >
        <DocsNotFound />
      </DocsPage>
    </ZorveusDocsLayout>
  );
}
