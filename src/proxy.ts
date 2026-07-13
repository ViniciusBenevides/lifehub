import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/cadastro", "/recuperar-senha", "/redefinir-senha"];

/**
 * Proteção otimista de rotas: verifica apenas a existência do cookie de
 * sessão. A validação real da sessão acontece no layout do grupo (app).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(getSessionCookie(request));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (pathname === "/") {
    return NextResponse.redirect(new URL(hasSessionCookie ? "/inicio" : "/login", request.url));
  }

  if (isAuthRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL("/inicio", request.url));
  }

  if (!isAuthRoute && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirecionar", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/inicio/:path*",
    "/dashboard/:path*",
    "/metas/:path*",
    "/habitos/:path*",
    "/financas/:path*",
    "/sonhos/:path*",
    "/atividades/:path*",
    "/projetos/:path*",
    "/notas/:path*",
    "/estudos/:path*",
    "/pomodoro/:path*",
    "/compras/:path*",
    "/aniversarios/:path*",
    "/diario/:path*",
    "/humor/:path*",
    "/diario-sonhos/:path*",
    "/pesquisar/:path*",
    "/backup/:path*",
    "/temas/:path*",
    "/perfil/:path*",
    "/mais/:path*",
    "/login",
    "/cadastro",
    "/recuperar-senha",
    "/redefinir-senha",
  ],
};
