import { NextRequest } from "next/server"

import {
  authenticatedRoutes,
  unauthenticatedRoutes,
} from "@/common/constants/routes"

export function proxy(request: NextRequest) {
  const auth = request.cookies.get("Authentication")?.value

  if (
    !auth &&
    !unauthenticatedRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route.path),
    )
  ) {
    return Response.redirect(new URL("/auth/login", request.url))
  }

  if (
    auth &&
    !authenticatedRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route.path),
    )
  ) {
    return Response.redirect(new URL("/dashboard", request.url))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
