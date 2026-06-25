import { proxyToBackend } from '@/lib/cms/proxy';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(`/api/v1/lawyer/conversations/${id}/messages`, request);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  return proxyToBackend(`/api/v1/lawyer/conversations/${id}/messages`, request, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
