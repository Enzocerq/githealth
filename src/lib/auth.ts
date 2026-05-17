import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";

/**
 * Configuração completa do NextAuth com PrismaAdapter.
 * Usada em Server Components, API Routes e Server Actions.
 * NÃO importar no middleware — Edge Runtime não suporta Prisma.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user, profile }) {
      const githubProfile = profile as
        | { id?: string | number; login?: string }
        | undefined;

      if (user.id && githubProfile?.login) {
        await db.user.update({
          where: { id: user.id },
          data: {
            githubLogin: githubProfile.login,
            githubId: githubProfile.id ? String(githubProfile.id) : undefined,
          },
        });
      }

      return true;
    },

    async jwt({ token, user, account, profile }) {
      if (user?.id) {
        token.id = user.id;
      }

      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      const githubProfile = profile as
        | { id?: string | number; login?: string }
        | undefined;

      if (githubProfile?.login) {
        token.githubLogin = githubProfile.login;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.githubLogin =
          typeof token.githubLogin === "string" ? token.githubLogin : null;
      }

      return session;
    },
  },
});
