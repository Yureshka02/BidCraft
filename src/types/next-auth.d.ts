import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    email: string;
    role: "ADMIN" | "BUYER" | "PROVIDER";
    status: "ACTIVE" | "BANNED";
    password_hash?: string; // only used on server
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: "ADMIN" | "BUYER" | "PROVIDER";
      status: "ACTIVE" | "BANNED";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "BUYER" | "PROVIDER";
    status: "ACTIVE" | "BANNED";
  }
}
