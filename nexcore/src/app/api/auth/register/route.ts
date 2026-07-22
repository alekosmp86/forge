import { NextRequest, NextResponse } from 'next/server';
import { registerSchema, userService, badRequest, conflict, toErrorResponse } from '@/core';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest('Validation failed', parsed.error.flatten());
    }

    const existingUser = await userService.findByEmail(parsed.data.email);
    if (existingUser) {
      return conflict('A user with this email already exists');
    }

    const newUser = await userService.create({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
