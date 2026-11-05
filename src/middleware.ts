import { NextRequest, NextResponse } from "next/server";

// Middleware leve para Edge Runtime: apenas verifica presença do cookie de sessão.
// A verificação real do token acontece nos Server Components e API Routes.

function isPublicPath(pathname: string): boolean {
  const publicRoutes = ["/", "/app/login", "/app/cadastro", "/admin/login"];
  if (publicRoutes.includes(pathname)) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname.startsWith("/api/leads")) return true;
  if (pathname.startsWith("/api/plans")) return true;
  if (pathname.startsWith("/api/landing")) return true;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/uploads") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".ico")
  ) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Repassa o pathname para Server Components via header (sempre, inclusive em rotas públicas)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  const next = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Permite rotas públicas
  if (isPublicPath(pathname)) {
    return next;
  }

  // Verifica cookie de sessão (apenas presença; validação real no servidor)
  const token = request.cookies.get("fuelgest_token")?.value;
  const hasImpersonation = request.cookies.get("fuelgest_impersonate")?.value;

  if (!token) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (pathname.startsWith("/app")) {
      return NextResponse.redirect(new URL("/app/login", request.url));
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
  }

  return next;
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
