import { proxyToBackend } from '@/lib/cms/proxy';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  return proxyToBackend(`/api/v1/lawyer/qa/questions/${encodeURIComponent(id)}`, request);
}
