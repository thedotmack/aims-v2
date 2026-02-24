import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export const proxy = auth((req) => {
  const isAuthenticated = !!req.auth
  const { pathname } = req.nextUrl

  // Protected route patterns
  const isProtectedDashboardRoute = pathname.startsWith("/dashboard")
  const isProtectedApiRoute = pathname.startsWith("/api/workspace")

  if (!isAuthenticated && isProtectedDashboardRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    return Response.redirect(loginUrl)
  }

  if (!isAuthenticated && isProtectedApiRoute) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/api/workspace/:path*"],
}
