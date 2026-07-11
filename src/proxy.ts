import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"


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
        const isPublic = publicPaths.includes(pathname) || pathname.startsWith("/bundles/");

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
    '/((?!register|login|collection/*|mail/verify-email|mail/verify|forgot-password|password/reset-password/*|select-role|api/auth|_next/static|_next/image|favicon.svg|logo.png).*)'
  ],
};