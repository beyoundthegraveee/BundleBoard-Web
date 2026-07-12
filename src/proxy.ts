import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const PRIVATE_PATHS = [
  "/profile",
  "/settings",
  "/favorites",
  "/stash",
];

const isPrivatePath = (pathname: string) =>
  PRIVATE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export default withAuth(
  function proxy() {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (isPrivatePath(pathname)) {
          return !!token?.accessToken;
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.svg|logo.png).*)'
  ],
};