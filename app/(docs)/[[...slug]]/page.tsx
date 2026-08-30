import { source } from '@/lib/source';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page';
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
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <DocsTitle className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          {page.data.title}
        </DocsTitle>
        <CopyPageButton slug={params.slug} />
      </div>
      {page.data.description && (
        <DocsDescription className="text-zinc-400 text-sm sm:text-base leading-relaxed mt-2">
          {page.data.description}
        </DocsDescription>
      )}
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
