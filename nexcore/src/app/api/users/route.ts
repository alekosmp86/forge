import { NextRequest, NextResponse } from 'next/server';
import { validateSession, paginationSchema, forbidden, unauthorized, toErrorResponse, prisma } from '@/core';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await validateSession();
    if (!session) {
      return unauthorized('Authentication required');
    }

    if (session.role !== 'ADMIN') {
      return forbidden('Admin role required');
    }

    const searchParams = req.nextUrl.searchParams;
    const { page, pageSize } = paginationSchema.parse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: { id: true, email: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      data: users,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
