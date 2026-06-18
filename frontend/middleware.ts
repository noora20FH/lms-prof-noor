import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/student", "/professor", "/admin"];

function hasLaravelSession(request: NextRequest) {
  const cookieNames = request.cookies.getAll().map((cookie) => cookie.name);

  return cookieNames.some((name) => {
    return (
      name === "laravel_session" ||
      name === "laravel-session" ||
      name === "lms_session" ||
      name === "lms-session" ||
      name.endsWith("_session") ||
      name.endsWith("-session")
    );
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!hasLaravelSession(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/professor/:path*", "/admin/:path*"],
};