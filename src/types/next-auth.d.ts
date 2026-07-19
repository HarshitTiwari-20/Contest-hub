import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      xp: number;
      level: number;
      streak: number;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    xp?: number;
    level?: number;
    streak?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    xp?: number;
    level?: number;
    streak?: number;
  }
}
