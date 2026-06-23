import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/cms/backend-url';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  if (!type || !['ipc', 'bns'].includes(type)) {
    return NextResponse.json({ error: 'Query param ?type=ipc|bns is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/sections?type=${type}`, {
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
