import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const RESERVED_TOP_SEGMENTS = new Set([
  "about",
  "bundles",
  "terms",
  "register",
  "login",
  "mail",
  "select-role",
  "favorites",
  "profile",
  "settings",
  "stash",
  "password",
  "forgot-password",
  "api",
]);

const isUsernameSlugPath = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 2) return false;
  return !RESERVED_TOP_SEGMENTS.has(segments[0]);
};

export default withAuth(
  function proxy() {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const publicPaths = [
          "/",
          "/about",
          "/bundles",
          "/terms",
          "/register",
          "/login",
          "/mail/verify-email",
          "/mail/verify",
          "/select-role"
        ];
        const isPublic = 
          publicPaths.includes(pathname) || 
          pathname.startsWith("/bundles/") ||
          isUsernameSlugPath(pathname);

        if (isPublic) return true;
        return !!token?.accessToken;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: [
    '/((?!register|login|mail/verify-email|mail/verify|forgot-password|password/reset-password/*|select-role|api/auth|_next/static|_next/image|favicon.svg|logo.png).*)'
  ],
};