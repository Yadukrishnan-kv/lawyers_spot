import { proxyToBackend } from '@/lib/cms/proxy';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  return proxyToBackend(`/api/v1/user/notifications/${encodeURIComponent(id)}`, request, {
    method: 'DELETE',
  });
}
