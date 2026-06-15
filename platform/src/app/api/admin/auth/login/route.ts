import { NextResponse } from 'next/server';
import {
  getAdminCredentials,
  createSessionToken,
  COOKIE_NAME,
  sessionCookieOptions,
} from '@/lib/cms/auth';
import { getBackendUrl } from '@/lib/cms/backend-url';
import { forwardBackendResponse } from '@/lib/cms/proxy';

export async function POST(request: Request) {
  const body = await request.text();

  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok || res.status === 401) {
      return forwardBackendResponse(res);
    }
  } catch {
    /* Node API offline — use local auth below */
  }

  try {
    const { email, password } = JSON.parse(body);
    const creds = getAdminCredentials();

    if (email !== creds.email || password !== creds.password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = createSessionToken(email);
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, sessionCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
