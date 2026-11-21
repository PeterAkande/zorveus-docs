import prompts from '@/lib/integration-prompts.json';

export function GET(request: Request) {
  const route = new URL(request.url).searchParams.get('route');
  if (route !== 'gateway' && route !== 'business' && route !== 'oauth') {
    return new Response('Choose gateway, business, or oauth.', { status: 400 });
  }
  return new Response((prompts as Record<string, string>)[route], {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="zorveus-${route}-integration-prompt.md"`,
    },
  });
}
