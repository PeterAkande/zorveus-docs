import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import Image from 'next/image';
import type { ReactNode } from 'react';

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <div className="flex items-center gap-2.5">
            <Image
              src="/zorveus-mark.svg"
              alt="Zorveus Logo"
              width={24}
              height={24}
              className="shrink-0"
            />
            <span className="font-bold text-lg text-zinc-100 tracking-tight">Zorveus</span>
            <span
              style={{
                fontSize: '9px',
                lineHeight: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
              className="inline-flex items-center font-mono font-semibold text-[#4DFFB4] bg-[#4DFFB4]/12 border border-[#4DFFB4]/30 uppercase tracking-wider"
            >
              DOCS
            </span>
          </div>
        ),
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
