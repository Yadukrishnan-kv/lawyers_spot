import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/cms/auth';
import { proxyToBackend } from '@/lib/cms/proxy';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  return proxyToBackend(`/api/v1/admin/clients/${id}`, request, {
    method: 'PATCH',
    body: JSON.stringify(await request.json()),
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  return proxyToBackend(`/api/v1/admin/clients/${id}`, request, { method: 'DELETE' });
}
