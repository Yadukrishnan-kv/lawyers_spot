import { proxyToBackend } from '@/lib/cms/proxy';

export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend('/api/v1/lawyer/subscription/renew', request, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}
