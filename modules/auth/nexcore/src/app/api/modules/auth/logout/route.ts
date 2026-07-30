import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/services/AuthService';

export async function POST(req: NextRequest): Promise<NextResponse> {
  await authService.logout();
  return NextResponse.redirect(new URL('/login', req.url), 303);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  await authService.logout();
  return NextResponse.redirect(new URL('/login', req.url), 302);
}
