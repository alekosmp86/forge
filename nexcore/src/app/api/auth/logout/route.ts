import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, toErrorResponse } from '@/core';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await deleteSession();
    return NextResponse.redirect(new URL('/login', req.url), 303);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await deleteSession();
    return NextResponse.redirect(new URL('/login', req.url), 302);
  } catch (error) {
    return toErrorResponse(error);
  }
}
