import { proxyToBackend } from '@/lib/cms/proxy';

export async function GET(request: Request) {
  return proxyToBackend('/api/v1/user/saved-lawyers', request);
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend('/api/v1/user/saved-lawyers', request, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}
