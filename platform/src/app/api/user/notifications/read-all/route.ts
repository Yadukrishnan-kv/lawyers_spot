import { proxyToBackend } from '@/lib/cms/proxy';

export async function PATCH(request: Request) {
  return proxyToBackend('/api/v1/user/notifications/read-all', request, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
}
