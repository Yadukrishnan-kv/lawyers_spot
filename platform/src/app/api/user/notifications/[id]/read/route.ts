import { proxyToBackend } from '@/lib/cms/proxy';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(`/api/v1/user/notifications/${encodeURIComponent(id)}/read`, _request, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
}
