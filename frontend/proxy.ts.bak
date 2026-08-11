import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const protectedRoutes = ["/student", "/professor", "/admin"];
const intlMiddleware = createIntlMiddleware(routing);

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

function getPathInfo(pathname: string) {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  const hasLocalePrefix = (routing.locales as readonly string[]).includes(maybeLocale);
  const locale = hasLocalePrefix ? maybeLocale : routing.defaultLocale;
  const pathnameWithoutLocale = hasLocalePrefix
    ? `/${segments.slice(2).join("/")}`.replace(/\/$/, "") || "/"
    : pathname;

  return {
    hasLocalePrefix,
    locale,
    pathnameWithoutLocale,
  };
}

function isProtectedPath(pathnameWithoutLocale: string) {
  return protectedRoutes.some((route) => {
    return (
      pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
    );
  });
}

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { hasLocalePrefix, locale, pathnameWithoutLocale } = getPathInfo(pathname);

  // Let next-intl normalize unprefixed URLs first, e.g. /login -> /id/login.
  if (!hasLocalePrefix) {
    return intlMiddleware(request);
  }

  if (isProtectedPath(pathnameWithoutLocale) && !hasLaravelSession(request)) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
