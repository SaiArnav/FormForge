import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sessionId = (formData.get('sessionId') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'application/octet-stream';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const uploaded = await db.uploadedFile.create({
      data: {
        url: dataUrl,
        filename: file.name,
        mimeType,
        size: file.size,
        sessionId: sessionId || null,
      },
    });

    return NextResponse.json({
      id: uploaded.id,
      filename: uploaded.filename,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
