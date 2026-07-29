import { proxyToBackend } from '@/lib/cms/proxy';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.text();
  return proxyToBackend(`/api/v1/user/bookings/${encodeURIComponent(id)}`, request, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}
