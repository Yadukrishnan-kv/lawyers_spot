import { proxyToBackend } from '@/lib/cms/proxy';

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  return proxyToBackend(`/api/v1/lawyer/articles/${encodeURIComponent(slug)}`, request);
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug } = await params;
  const body = await request.text();
  return proxyToBackend(`/api/v1/lawyer/articles/${encodeURIComponent(slug)}`, request, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

export async function DELETE(request: Request, { params }: Params) {
  const { slug } = await params;
  return proxyToBackend(`/api/v1/lawyer/articles/${encodeURIComponent(slug)}`, request, {
    method: 'DELETE',
  });
}
