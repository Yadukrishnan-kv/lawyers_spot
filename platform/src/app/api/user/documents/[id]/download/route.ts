import { proxyToBackend } from '@/lib/cms/proxy';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(`/api/v1/user/documents/${encodeURIComponent(id)}/download`, _request);
}
