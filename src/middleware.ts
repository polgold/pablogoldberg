import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Redirect root to default locale (Spanish)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/es", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
