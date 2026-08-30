import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slugParam = searchParams.get('slug') ?? '';

  const docsDir = path.join(process.cwd(), 'content/docs');
  const cleanSlug = slugParam.replace(/^\/+|\/+$/g, '');

  let candidatePaths: string[] = [];

  if (!cleanSlug) {
    candidatePaths = [path.join(docsDir, 'index.mdx')];
  } else {
    candidatePaths = [
      path.join(docsDir, `${cleanSlug}.mdx`),
      path.join(docsDir, cleanSlug, 'index.mdx'),
      path.join(docsDir, `${cleanSlug}.md`),
    ];
  }

  for (const fullPath of candidatePaths) {
    try {
      const rawMarkdown = await fs.readFile(fullPath, 'utf-8');
      return new NextResponse(rawMarkdown, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
        },
      });
    } catch {
      // Try next candidate
    }
  }

  return new NextResponse('Documentation file not found', { status: 404 });
}
