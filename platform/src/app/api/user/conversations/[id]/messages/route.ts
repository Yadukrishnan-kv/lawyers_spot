import { proxyToBackend } from '@/lib/cms/proxy';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(`/api/v1/user/conversations/${encodeURIComponent(id)}/messages`, _request);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await _request.text();
  return proxyToBackend(`/api/v1/user/conversations/${encodeURIComponent(id)}/messages`, _request, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}
