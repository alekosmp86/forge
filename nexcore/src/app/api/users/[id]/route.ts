import { NextRequest, NextResponse } from 'next/server';
import { validateSession, userService, idSchema, notFound, forbidden, unauthorized, badRequest, toErrorResponse } from '@/core';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await validateSession();
    if (!session) {
      return unauthorized('Authentication required');
    }

    const { id } = await context.params;
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) {
      return badRequest('Invalid user ID');
    }

    // RBAC: users can only view their own profile unless they are ADMIN
    if (session.userId !== id && session.role !== 'ADMIN') {
      return forbidden('You do not have permission to view this profile');
    }

    const user = await userService.findById(id);
    if (!user) {
      return notFound('User');
    }

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
