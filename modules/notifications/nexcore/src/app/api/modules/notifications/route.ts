import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateSession } from '@/core/auth/session';
import { notificationService } from '@/modules/notifications/services/NotificationService';

const createSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']).optional(),
});

export async function GET() {
  const session = await validateSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notifications = await notificationService.findByUserId(session.userId);
  return NextResponse.json({ data: notifications });
}

export async function POST(req: NextRequest) {
  const session = await validateSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const notification = await notificationService.create({
    userId: session.userId,
    title: parsed.data.title,
    message: parsed.data.message,
    type: parsed.data.type,
  });

  return NextResponse.json({ data: notification }, { status: 201 });
}
