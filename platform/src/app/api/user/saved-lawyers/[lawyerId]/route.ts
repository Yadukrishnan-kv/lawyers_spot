import { proxyToBackend } from '@/lib/cms/proxy';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ lawyerId: string }> },
) {
  const { lawyerId } = await params;
  return proxyToBackend(`/api/v1/user/saved-lawyers/${encodeURIComponent(lawyerId)}`, _request, {
    method: 'DELETE',
  });
}
