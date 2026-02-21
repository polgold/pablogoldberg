import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function getAdminWhitelist(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  const list = getAdminWhitelist();
  if (list.length === 0) return false;
  return list.includes(email.trim().toLowerCase());
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to default locale (Spanish)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/es", request.url));
  }

  // Redirect paths without locale (e.g. /work, /work/archive) to /es/...
  const sitePaths = ["/work", "/photography", "/about", "/contact"];
  const hasNoLocale = !pathname.startsWith("/es") && !pathname.startsWith("/en");
  const isSitePath = sitePaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (hasNoLocale && isSitePath) {
    return NextResponse.redirect(new URL("/es" + pathname, request.url));
  }

  // Admin: refresh session and protect routes
  if (pathname.startsWith("/admin")) {
    if (!url || !anon) {
      return NextResponse.next();
    }
    const response = NextResponse.next({ request });
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";
    const isUnauthorizedPage = pathname === "/admin/unauthorized" || pathname === "/admin/unauthorized/";
    if (isLoginPage) {
      if (user && isAllowedAdminEmail(user.email ?? undefined)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return response;
    }
    if (isUnauthorizedPage) {
      return response;
    }
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (!isAllowedAdminEmail(user.email ?? undefined)) {
      return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/work",
    "/work/:path*",
    "/photography",
    "/photography/:path*",
    "/about",
    "/contact",
    "/admin",
    "/admin/login",
    "/admin/unauthorized",
    "/admin/:path*",
  ],
};
