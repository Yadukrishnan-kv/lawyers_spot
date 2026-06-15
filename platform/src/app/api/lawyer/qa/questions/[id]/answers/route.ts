import { proxyToBackend } from '@/lib/cms/proxy';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.text();
  return proxyToBackend(`/api/v1/lawyer/qa/questions/${encodeURIComponent(id)}/answers`, request, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}
