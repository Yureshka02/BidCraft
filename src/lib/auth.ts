import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        await dbConnect();
        const user = await User.findOne({ email: creds.email }).lean<{
          _id: string;
          email: string;
          password_hash: string;
          role: "ADMIN" | "BUYER" | "PROVIDER";
          status: "ACTIVE" | "BANNED";
        }>();

        if (!user) return null;
        if (user.status === "BANNED") {
          throw new Error("Account banned");
        }

        const ok = await bcrypt.compare(creds.password, user.password_hash);
        if (!ok) return null;

        return {
          id: String(user._id),
          email: user.email,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = (user as any).id;
      token.role = (user as any).role;
      token.status = (user as any).status;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      (session.user as any).id = token.id as string;
      (session.user as any).role = token.role as string;
      (session.user as any).status = token.status as string;
    }
    return session;
  },
  async redirect({ url, baseUrl }) {
    // Redirect based on role after login
    if (url.startsWith(baseUrl)) return url; // keep default for safe redirects
    return baseUrl;
  },
},
pages: {
  signIn: "/login",
},
};
