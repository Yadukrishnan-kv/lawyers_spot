import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(request: Request) {
  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ detail: 'Invalid form data' }, { status: 400 });
    }

    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ detail: 'No file provided' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ detail: 'Use JPEG, PNG, WebP, or GIF' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ detail: 'Image must be under 5 MB' }, { status: 400 });
    }

    const ext = EXT_BY_TYPE[file.type] ?? 'jpg';
    const filename = `article-admin-${Date.now()}.${ext}`;
    const dir = path.join(process.cwd(), 'public', 'uploads', 'articles');

    await mkdir(dir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), bytes);

    const url = `/uploads/articles/${filename}`;
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Image upload error:', message);
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
