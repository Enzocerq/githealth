import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Middleware de proteção de rotas — Edge Runtime.
 * Usa authConfig sem Prisma para verificar o JWT a cada requisição.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
