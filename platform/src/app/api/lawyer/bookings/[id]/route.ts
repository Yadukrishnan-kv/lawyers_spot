import { proxyToBackend } from '@/lib/cms/proxy';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.text();
  return proxyToBackend(`/api/v1/lawyer/bookings/${encodeURIComponent(id)}`, request, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}
