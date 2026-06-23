import { NextResponse } from 'next/server';
import { getSession } from '@/lib/cms/auth';
import { getBackendUrl } from '@/lib/cms/backend-url';
import { proxyToBackend } from '@/lib/cms/proxy';

type Props = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Props) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  return proxyToBackend(`/api/v1/admin/sections/${id}`, request, {
    headers: { cookie: request.headers.get('cookie') ?? '' },
  });
}

export async function PUT(request: Request, { params }: Props) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  return proxyToBackend(`/api/v1/admin/sections/${id}`, request, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: await request.text(),
  });
}

export async function DELETE(request: Request, { params }: Props) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  return proxyToBackend(`/api/v1/admin/sections/${id}`, request, {
    method: 'DELETE',
    headers: { cookie: request.headers.get('cookie') ?? '' },
  });
}
