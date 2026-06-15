import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/cms/auth';
import { getAdminCmsData, saveCmsData } from '@/lib/cms/store';
import type { CmsData } from '@/lib/cms/types';
import { getBackendUrl } from '@/lib/cms/backend-url';
import { forwardBackendResponse } from '@/lib/cms/proxy';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/admin/cms`, {
      headers: { cookie: request.headers.get('cookie') ?? '' },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) return forwardBackendResponse(res);
  } catch {
    /* use local CMS */
  }

  return NextResponse.json(await getAdminCmsData());
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as CmsData;

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');

    const res = await fetch(`${getBackendUrl()}/api/v1/admin/cms`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) return forwardBackendResponse(res);
  } catch {
    /* save to cms.json */
  }

  const saved = saveCmsData(body);
  return NextResponse.json(saved);
}
