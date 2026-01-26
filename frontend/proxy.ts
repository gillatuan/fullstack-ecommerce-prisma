import { NextRequest } from "next/server";
import { unauthenticatedRoutes } from "./app/common/constants/routes";
import authenticated from "./actions/authenticated";

export function proxy(request: NextRequest) {
  if (
    !authenticated() &&
    !unauthenticatedRoutes.some((route: { path: string; }) =>
      request.nextUrl.pathname.startsWith(route.path)
    )
  ) {
    return Response.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};