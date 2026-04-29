// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // 1. Kalau belum login → redirect ke login
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Role-based protection
  if (token) {
    const role = token.role as string;

    // Professor hanya boleh akses professor routes
    if (role === 'professor' && pathname.startsWith('/dashboard/student')) {
      return NextResponse.redirect(new URL('/dashboard/professor', request.url));
    }

    // Student hanya boleh akses student routes
    if (role === 'student' && pathname.startsWith('/dashboard/professor')) {
      return NextResponse.redirect(new URL('/dashboard/student', request.url));
    }

    // Blokir akses langsung ke halaman role yang salah
    if (pathname === '/dashboard' && role === 'professor') {
      return NextResponse.redirect(new URL('/dashboard/professor', request.url));
    }
    if (pathname === '/dashboard' && role === 'student') {
      return NextResponse.redirect(new URL('/dashboard/student', request.url));
    }
  }

  return NextResponse.next();
}

// Matcher: middleware hanya jalan di route berikut
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/professor/:path*',
    '/student/:path*',
    '/courses/:path*',
    '/assignments/:path*',
  ],
};