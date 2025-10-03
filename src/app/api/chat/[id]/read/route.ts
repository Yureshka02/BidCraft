export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import Conversation from "@/models/Conversation";

export async function PATCH(req: NextRequest, context: any) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = typeof context?.params?.then === "function" ? await context.params : context?.params;
  const id = params?.id as string;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const conv = await Conversation.findById(id);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isBuyer = String(conv.buyerId) === session.user.id;
  const isProvider = String(conv.providerId) === session.user.id;
  if (!isBuyer && !isProvider) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await Conversation.updateOne(
    { _id: conv._id },
    isBuyer ? { $set: { buyerUnread: 0 } } : { $set: { providerUnread: 0 } }
  );

  return NextResponse.json({ ok: true });
}
