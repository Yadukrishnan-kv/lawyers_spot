import { proxyToBackend } from '@/lib/cms/proxy';

export async function GET(request: Request) {
  return proxyToBackend('/api/v1/user/profile', request);
}

export async function PATCH(request: Request) {
  const body = await request.text();
  return proxyToBackend('/api/v1/user/profile', request, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}
