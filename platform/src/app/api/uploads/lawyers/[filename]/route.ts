import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const ext = path.extname(filename).replace('.', '').toLowerCase();
  const mime = MIME[ext] ?? 'application/octet-stream';
  const filepath = path.join(process.cwd(), 'data', 'uploads', 'lawyers', filename);

  try {
    const bytes = await readFile(filepath);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return NextResponse.json({ detail: 'File not found' }, { status: 404 });
  }
}
