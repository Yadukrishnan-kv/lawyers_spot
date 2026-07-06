import { NextResponse } from 'next/server';
import { getSession } from '@/lib/cms/auth';
import { getBackendUrl } from '@/lib/cms/backend-url';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();

    const backendFormData = new FormData();
    const file = formData.get('file');
    if (file instanceof File) {
      backendFormData.append('file', file, file.name);
    } else {
      return NextResponse.json({ detail: 'No file provided' }, { status: 400 });
    }

    const res = await fetch(`${getBackendUrl()}/api/v1/admin/pending-lawyers/import`, {
      method: 'POST',
      headers: { cookie: request.headers.get('cookie') ?? '' },
      body: backendFormData,
      signal: AbortSignal.timeout(60000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Backend API is not running.' }, { status: 503 });
  }
}
