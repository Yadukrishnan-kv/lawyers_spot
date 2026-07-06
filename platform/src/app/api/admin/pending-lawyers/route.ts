import { NextResponse } from 'next/server';
import { getSession } from '@/lib/cms/auth';
import { getBackendUrl } from '@/lib/cms/backend-url';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const path = url.pathname.replace('/api/admin/pending-lawyers', '');

  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/admin/pending-lawyers${path}${url.search}`, {
      headers: { cookie: request.headers.get('cookie') ?? '' },
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Backend API is not running.' }, { status: 503 });
  }
}
