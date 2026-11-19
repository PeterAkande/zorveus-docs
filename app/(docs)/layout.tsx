import type { ReactNode } from 'react';
import { ZorveusDocsLayout } from '@/components/layout/ZorveusDocsLayout';
import { buildGroupedNavigationTree } from '@/lib/navigation-tree.mjs';
import { source } from '@/lib/source';

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  const tree = buildGroupedNavigationTree(source.pageTree);

  return (
    <>
      <a href="#nd-page" className="zorveus-skip-link">
        Skip to main content
      </a>
      <ZorveusDocsLayout tree={tree}>{children}</ZorveusDocsLayout>
    </>
  );
}
