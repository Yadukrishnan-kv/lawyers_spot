import { NextResponse } from 'next/server';
import { getSession } from '@/lib/cms/auth';
import { getBackendUrl } from '@/lib/cms/backend-url';
import { proxyToBackend } from '@/lib/cms/proxy';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  if (!type || !['ipc', 'bns'].includes(type)) {
    return NextResponse.json({ error: 'Query param ?type=ipc|bns is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/admin/sections?type=${type}`, {
      headers: { cookie: request.headers.get('cookie') ?? '' },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    /* fallback */
  }

  return NextResponse.json([]);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return proxyToBackend('/api/v1/admin/sections', request, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: await request.text(),
  });
}
