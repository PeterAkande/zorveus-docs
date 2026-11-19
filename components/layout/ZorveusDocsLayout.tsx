'use client';

import type { ReactNode } from 'react';
import type * as PageTree from 'fumadocs-core/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { BookOpen, Code2, FlaskConical, Terminal } from 'lucide-react';
import Image from 'next/image';

interface ZorveusDocsLayoutProps {
  tree: PageTree.Root;
  children: ReactNode;
}

function TabLabel({ url, title }: { url: string; title: ReactNode }) {
  let icon = <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />;
  if (url.startsWith('/code-labs')) {
    icon = <FlaskConical className="size-3.5 shrink-0" aria-hidden="true" />;
  } else if (url.startsWith('/cli')) {
    icon = <Terminal className="size-3.5 shrink-0" aria-hidden="true" />;
  } else if (url.startsWith('/api-reference')) {
    icon = <Code2 className="size-3.5 shrink-0" aria-hidden="true" />;
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      <span>{title}</span>
    </span>
  );
}

export function ZorveusDocsLayout({ tree, children }: ZorveusDocsLayoutProps) {
  return (
    <DocsLayout
      tree={tree}
      tabMode="navbar"
      nav={{
        mode: 'top',
        title: (
          <div className="flex items-center gap-2.5">
            <Image
              src="/zorveus-mark.svg"
              alt="Zorveus Logo"
              width={24}
              height={24}
              className="shrink-0"
            />
            <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
              Zorveus
            </span>
            <span
              style={{
                fontSize: '9px',
                lineHeight: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
              className="inline-flex items-center font-mono font-semibold text-[#08734c] dark:text-[#4DFFB4] bg-[#4DFFB4]/12 border border-[#08734c]/30 dark:border-[#4DFFB4]/30 uppercase tracking-wider"
            >
              DOCS
            </span>
          </div>
        ),
      }}
      tabs={{
        transform(option) {
          return {
            ...option,
            icon: undefined,
            title: <TabLabel url={option.url} title={option.title} />,
          };
        },
      }}
      links={[
        { text: 'Dashboard', url: 'https://app.zorveus.com', external: true },
        { text: 'API Status', url: 'https://status.zorveus.com', external: true },
        { text: 'GitHub', url: 'https://github.com/zorveus', external: true },
      ]}
      sidebar={{
        collapsible: false,
      }}
    >
      {children}
    </DocsLayout>
  );
}

