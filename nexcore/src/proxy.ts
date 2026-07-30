import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS: string[] = [
  '/',
  '/login',
  '/register',
  '/api/modules/auth/login',
  '/api/modules/auth/register',
];

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/manifest') ||
    /\.(ico|png|svg|webmanifest|jpg|jpeg|gif|webp|woff|woff2|ttf)$/.test(pathname)
  );
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (isStaticAsset(pathname) || PUBLIC_PATHS.some((publicPath) => pathname === publicPath || pathname.startsWith(publicPath))) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
