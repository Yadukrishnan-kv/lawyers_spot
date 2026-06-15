import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/cms/auth';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  const lawyerId = String(formData.get('lawyerId') ?? '').trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!lawyerId) {
    return NextResponse.json({ error: 'Lawyer ID required' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Use JPEG, PNG, WebP, or GIF' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 400 });
  }

  const ext = EXT_BY_TYPE[file.type] ?? 'jpg';
  const safeId = lawyerId.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 64) || 'lawyer';
  const filename = `${safeId}-${Date.now()}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads', 'lawyers');

  await mkdir(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);

  const url = `/uploads/lawyers/${filename}`;
  return NextResponse.json({ url });
}
