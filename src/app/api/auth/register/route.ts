import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  await dbConnect();

  const { email, password, role } = await req.json();

  if (!email || !password || !["BUYER", "PROVIDER"].includes(role)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const exists = await User.findOne({ email }).lean();
  if (exists) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password_hash,
    role,
    status: "ACTIVE",
  });

  return NextResponse.json(
    { id: user._id, email: user.email, role: user.role },
    { status: 201 }
  );
}
