import { NextResponse } from 'next/server';
import { getSession } from '@/lib/cms/auth';
import { getBackendUrl } from '@/lib/cms/backend-url';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/admin/pending-lawyers/${id}/verify`, {
      method: 'POST',
      headers: { cookie: request.headers.get('cookie') ?? '' },
      signal: AbortSignal.timeout(30000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Backend API is not running.' }, { status: 503 });
  }
}
