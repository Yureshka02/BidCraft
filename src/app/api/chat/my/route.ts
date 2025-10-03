export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import Conversation from "@/models/Conversation";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const myId = new mongoose.Types.ObjectId(session.user.id);
  const items = await Conversation.find({
    $or: [{ buyerId: myId }, { providerId: myId }],
  })
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json({ items });
}
