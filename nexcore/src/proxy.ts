import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, hashTokenId, SESSION_COOKIE_NAME, prisma } from '@/core';

// ─── Public Paths ─────────────────────────────────────────────────────────────

const PUBLIC_PATHS: string[] = [
  '/login',
  '/api/auth/login',
  '/api/auth/register',
];

// ─── Static Asset Patterns ────────────────────────────────────────────────────

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/manifest') ||
    /\.(ico|png|svg|webmanifest|jpg|jpeg|gif|webp|woff|woff2|ttf)$/.test(pathname)
  );
}

// ─── Helper for Unauthorized Responses ────────────────────────────────────────

function handleUnauthorized(req: NextRequest, pathname: string): NextResponse {
  if (pathname.startsWith('/api/')) {
    const errorResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    errorResponse.cookies.delete(SESSION_COOKIE_NAME);
    return errorResponse;
  }

  const loginUrl = new URL('/login', req.url);
  const redirectResponse = NextResponse.redirect(loginUrl);
  redirectResponse.cookies.delete(SESSION_COOKIE_NAME);
  return redirectResponse;
}

// ─── Proxy (Route Guard) ──────────────────────────────────────────────────────

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((publicPath) => pathname.startsWith(publicPath))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return handleUnauthorized(req, pathname);
  }

  const session = await verifySessionToken(token);
  if (!session || !session.jti) {
    return handleUnauthorized(req, pathname);
  }

  // Verify token revocation in database (backend invalidation guard)
  try {
    const tokenHash = await hashTokenId(session.jti);
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: { revokedAt: true, expiresAt: true },
    });

    if (!tokenRecord || tokenRecord.revokedAt !== null || tokenRecord.expiresAt < new Date()) {
      return handleUnauthorized(req, pathname);
    }
  } catch (dbError) {
    console.error('[proxy] Database revocation check failed:', dbError);
    return handleUnauthorized(req, pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
