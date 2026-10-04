import prompts from '@/lib/integration-prompts.json';

export function GET(request: Request) {
  const route = new URL(request.url).searchParams.get('route');
  if (route !== 'business' && route !== 'oauth') {
    return new Response('Choose business or oauth.', { status: 400 });
  }
  return new Response(prompts[route], {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="zorveus-${route}-integration-prompt.md"`,
    },
  });
}
