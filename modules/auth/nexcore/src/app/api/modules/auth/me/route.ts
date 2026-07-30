import { NextResponse } from 'next/server';
import { authService } from '@/modules/auth/services/AuthService';

export async function GET(): Promise<NextResponse> {
  const session = await authService.validateSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    data: {
      id: session.userId,
      email: session.email,
      role: session.role,
      expiresAt: session.expiresAt,
    },
  });
}
