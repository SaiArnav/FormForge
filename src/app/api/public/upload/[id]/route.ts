import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const file = await db.uploadedFile.findUnique({ where: { id } });
  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: file.id,
    url: file.url,
    filename: file.filename,
    mimeType: file.mimeType,
    size: file.size,
  });
}
