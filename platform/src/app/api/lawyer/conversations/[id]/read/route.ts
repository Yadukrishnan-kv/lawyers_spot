import { proxyToBackend } from '@/lib/cms/proxy';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(`/api/v1/lawyer/conversations/${id}/read`, request, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
}
