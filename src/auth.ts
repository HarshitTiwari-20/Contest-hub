import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth";
import { apiLogin } from "@/lib/api";

// Ensure builds succeed even when AUTH_SECRET is not yet set in the environment.
// Set a real AUTH_SECRET in Vercel project settings for production.
if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  process.env.AUTH_SECRET =
    process.env.NODE_ENV === "production"
      ? "contest-hub-build-placeholder-change-me"
      : "contest-hub-dev-secret";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const result = await apiLogin(parsed.data);
        if ("error" in result) {
          return null;
        }

        const { user } = result;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.username,
          image: user.avatarUrl,
          username: user.username,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.xp = user.xp;
        token.level = user.level;
        token.streak = user.streak;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = (token.username as string) ?? "";
        session.user.xp = (token.xp as number) ?? 0;
        session.user.level = (token.level as number) ?? 1;
        session.user.streak = (token.streak as number) ?? 0;
      }
      return session;
    },
  },
  trustHost: true,
});
