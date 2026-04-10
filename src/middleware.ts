import { NextRequest, NextResponse } from "next/server";
import { decodeSession } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const publicRoutes = ["/login", "/", "/vitrine"];
  const protectedRoutes = ["/dashboard", "/clientes", "/estoque"];
  const adminRoutes = ["/admin"];

  const isPublicRoute = publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));

  const token = req.cookies.get("auth_session")?.value;
  const session = token ? decodeSession(token) : null;

  // Rota protegida sem sessão válida → redireciona para login
  if ((isProtectedRoute || isAdminRoute) && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Rota admin: verifica role
  if (isAdminRoute && session) {
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Já autenticado tentando acessar /login → vai para dashboard
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
