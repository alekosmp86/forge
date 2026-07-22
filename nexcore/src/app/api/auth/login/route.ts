import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { loginSchema, createSession, badRequest, toErrorResponse, prisma } from '@/core';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest('Invalid credentials', parsed.error.flatten());
    }

    const { email, password } = parsed.data;

    // Use constant-time comparison to prevent timing attacks
    const DUMMY_HASH = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKyDAl4sPPZpFxK';

    const rawUser = await prisma.user.findUnique({ where: { email } });

    const isPasswordValid = await bcrypt.compare(password, rawUser?.passwordHash ?? DUMMY_HASH);

    if (!rawUser || !isPasswordValid || !rawUser.isActive) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await createSession({
      userId: rawUser.id,
      email: rawUser.email,
      role: rawUser.role,
    });

    return NextResponse.json({
      data: { id: rawUser.id, email: rawUser.email, role: rawUser.role },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
