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
        const user = await User.findOne({ email: creds.email }).lean();

        if (!user || Array.isArray(user)) return null;
        if ((user as any).status === "BANNED") {
          throw new Error("Account banned");
        }

        const ok = await bcrypt.compare(creds.password, (user as any).password_hash);
        if (!ok) return null;

        // ✅ Return only safe fields (not password_hash)
        return {
          id: String((user as any)._id),
          email: (user as any).email,
          role: (user as any).role,
          status: (user as any).status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Copy fields from user → token at login
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose fields to client session
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).status = token.status as string;
      }
      return session;
    },
  },
  pages: {
    // You can override these if you create custom pages
    signIn: "/login",
    error: "/login", // redirect on errors
  },
};
