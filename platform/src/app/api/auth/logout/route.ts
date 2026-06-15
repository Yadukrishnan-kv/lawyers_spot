import { proxyToBackend } from '@/lib/cms/proxy';

export async function POST(request: Request) {
  return proxyToBackend('/api/v1/auth/logout', request, { method: 'POST' });
}
