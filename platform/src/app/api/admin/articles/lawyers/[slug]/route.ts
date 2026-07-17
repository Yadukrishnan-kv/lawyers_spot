import { NextResponse } from 'next/server';
import { getSession } from '@/lib/cms/auth';
import { proxyToBackend } from '@/lib/cms/proxy';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug } = await params;
  return proxyToBackend(`/api/v1/admin/articles/${encodeURIComponent(slug)}/lawyers`, _request);
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug } = await params;
  const body = await request.text();
  return proxyToBackend(`/api/v1/admin/articles/${encodeURIComponent(slug)}/lawyers`, request, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}
