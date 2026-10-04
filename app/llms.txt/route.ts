import { source } from '@/lib/source';
import { buildLlmsIndex } from '@/lib/docs-export.mjs';

export function GET() {
  const pages = source.getPages().map((page) => ({
    url: page.url,
    title: page.data.title,
    description: page.data.description,
  }));
  return new Response(buildLlmsIndex(pages), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
