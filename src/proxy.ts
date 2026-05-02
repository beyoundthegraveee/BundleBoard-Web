import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"


export default withAuth(
  function proxy(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token?.accessToken,
    },
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: ['/((?!register|login|api).*)'],
};