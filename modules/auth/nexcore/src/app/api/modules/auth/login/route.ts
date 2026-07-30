import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/modules/auth/services/AuthService';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid credentials payload' }, { status: 400 });
    }

    const result = await authService.login(parsed.data);
    return NextResponse.json({ data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
