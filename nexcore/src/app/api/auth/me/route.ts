import { NextResponse } from 'next/server';
import { validateSession, userService, unauthorized, toErrorResponse } from '@/core';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await validateSession();
    if (!session) {
      return unauthorized('Not authenticated');
    }

    const user = await userService.findById(session.userId);
    if (!user) {
      return unauthorized('User not found');
    }

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
