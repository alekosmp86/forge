import { NextResponse, type NextRequest } from 'next/server';
import { validateSession } from '@/core/auth/session';
import { localStorageService } from '@/core/storage/LocalStorageService';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export async function POST(request: NextRequest) {
  try {
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 10MB' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadedFile = await localStorageService.uploadFile(
      buffer,
      file.name,
      file.type || 'application/octet-stream'
    );

    return NextResponse.json({ data: uploadedFile }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename parameter is required' }, { status: 400 });
    }

    const deleted = await localStorageService.deleteFile(filename);

    if (!deleted) {
      return NextResponse.json({ error: 'File not found or failed to delete' }, { status: 404 });
    }

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
