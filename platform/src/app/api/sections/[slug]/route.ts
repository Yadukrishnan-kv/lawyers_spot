import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/cms/backend-url';

type Props = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Props) {
  const { slug } = await params;

  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/sections/${slug}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    if (res.status === 404) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch {
    /* fallback */
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
