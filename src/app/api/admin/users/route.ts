export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
  const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "10"), 1), 100);
  const q = (searchParams.get("q") || "").trim();

  const match: any = {};
  if (q) {
    match.$or = [
      { email: { $regex: q, $options: "i" } },
      { role: { $regex: q, $options: "i" } },
      { status: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(match).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).select({
      email: 1, role: 1, status: 1, createdAt: 1,
    }).lean(),
    User.countDocuments(match),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}
