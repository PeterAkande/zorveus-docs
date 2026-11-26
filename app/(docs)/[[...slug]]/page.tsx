import { source } from '@/lib/source';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/layouts/notebook/page';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { useMDXComponents } from '@/mdx-components';
import { PageFeedback } from '@/components/mdx/PageFeedback';
import { CopyPageButton } from '@/components/mdx/CopyPageButton';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) {
    notFound();
  }

  const MDX = page.data.body;
  const components = useMDXComponents(defaultMdxComponents);

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: 'clerk',
        single: false,
      }}
      breadcrumb={{
        className: 'zorveus-breadcrumb',
      }}
    >
      <div className="zorveus-page-header">
        <DocsTitle className="zorveus-page-title">
          {page.data.title}
        </DocsTitle>
        {page.data.description && (
          <DocsDescription className="zorveus-page-description text-zinc-400 text-sm sm:text-base leading-relaxed mb-0">
            {page.data.description}
          </DocsDescription>
        )}
        <div className="zorveus-page-actions">
          <CopyPageButton slug={params.slug} />
          <a
            href={`/api/raw-doc?slug=${encodeURIComponent((params.slug ?? []).join('/'))}`}
            className="zorveus-markdown-link"
          >
            View as Markdown
          </a>
          <a
            href="/getting-started/coding-agents"
            className="zorveus-markdown-link"
          >
            Set up coding agent
          </a>
        </div>
      </div>
      <DocsBody>
        <MDX components={components} />
        <PageFeedback />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) return {};

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
