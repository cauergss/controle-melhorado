import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Rotas que não precisam de autenticação
  const publicRoutes = ["/login", "/", "/vitrine"];
  
  // Rotas que precisam de autenticação
  const protectedRoutes = ["/dashboard", "/clientes", "/estoque"];
  
  // Rotas que precisam de autenticação com role admin
  const adminRoutes = ["/admin"];

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Obter o cookie de autenticação
  const authCookie = req.cookies.get("auth_user")?.value;

  // Se estiver tentando acessar rota protegida/admin sem autenticação
  if ((isProtectedRoute || isAdminRoute) && !authCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Se estiver autenticado, verificar permissões de admin
  if (isAdminRoute && authCookie) {
    try {
      const user = JSON.parse(authCookie);
      if (user.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Se estiver logado e tentar acessar /login, redirecionar para dashboard
  if (isPublicRoute && pathname === "/login" && authCookie) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
