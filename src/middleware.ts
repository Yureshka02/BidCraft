import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const path = req.nextUrl.pathname;

  if (path.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  if (path.startsWith("/buyer") && token.role !== "BUYER") {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  if (path.startsWith("/provider") && token.role !== "PROVIDER") {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/buyer/:path*", "/provider/:path*"],
};
