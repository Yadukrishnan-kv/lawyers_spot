import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/cms/backend-url';

export function forwardBackendResponse(res: Response): NextResponse {
  const response = new NextResponse(res.body, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
  });

  const setCookies = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookies) {
    response.headers.append('set-cookie', c);
  }
  const legacy = res.headers.get('set-cookie');
  if (legacy && setCookies.length === 0) {
    response.headers.set('set-cookie', legacy);
  }

  return response;
}

export async function proxyToBackend(
  path: string,
  request: Request,
  init?: RequestInit,
): Promise<NextResponse> {
  const url = `${getBackendUrl()}${path}`;
  const headers = new Headers(init?.headers);
  const cookie = request.headers.get('cookie');
  if (cookie) headers.set('cookie', cookie);

  try {
    const res = await fetch(url, {
      ...init,
      headers,
      signal: AbortSignal.timeout(10000),
    });
    return forwardBackendResponse(res);
  } catch {
    return NextResponse.json(
      { error: 'Backend API is not running. Start Node API: cd backend-node && npm run dev' },
      { status: 503 },
    );
  }
}
