import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { source } from '@/lib/source';
import { resolveDocumentPath } from '@/lib/docs-export.mjs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slugParam = searchParams.get('slug') ?? '';

  const docsDir = path.join(process.cwd(), 'content/docs');
  const fullPath = resolveDocumentPath(slugParam, source.getPages(), docsDir);
  if (!fullPath) return new NextResponse('Documentation file not found', { status: 404 });
  try {
    const rawMarkdown = await fs.readFile(fullPath, 'utf-8');
    return new NextResponse(rawMarkdown, {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return new NextResponse('Documentation file not found', { status: 404 });
    }
    throw error;
  }
}
