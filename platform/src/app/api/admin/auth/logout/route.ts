import { NextResponse } from 'next/server';
import { COOKIE_NAME, sessionCookieOptions } from '@/lib/cms/auth';
import { getBackendUrl } from '@/lib/cms/backend-url';
import { forwardBackendResponse } from '@/lib/cms/proxy';

export async function POST() {
  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/admin/auth/logout`, {
      method: 'POST',
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      return forwardBackendResponse(res);
    }
  } catch {
    /* fallback below */
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
