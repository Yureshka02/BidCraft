export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose, { Types } from "mongoose";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

function authz(conv: any, userId: string) {
  return String(conv.buyerId) === userId || String(conv.providerId) === userId;
}

// GET ?cursor=<ISO or id>&limit=30
export async function GET(req: NextRequest, context: any) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = typeof context?.params?.then === "function" ? await context.params : context?.params;
  const id = params?.id as string;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const conv = await Conversation.findById(id).lean();
  if (!conv || !authz(conv, session.user.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

  const query: any = { conversationId: new Types.ObjectId(id) };
  if (cursor && mongoose.isValidObjectId(cursor)) query._id = { $gt: new Types.ObjectId(cursor) };
  // messages oldest→newest, with cursor by _id
  const items = await Message.find(query).sort({ _id: 1 }).limit(limit).lean();

  const nextCursor = items.length ? String(items[items.length - 1]._id) : null;
  return NextResponse.json({ items: items.map(m => ({
    _id: String(m._id),
    senderId: String(m.senderId),
    text: m.text,
    createdAt: m.createdAt,
  })), nextCursor });
}

// POST { text }
export async function POST(req: NextRequest, context: any) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = typeof context?.params?.then === "function" ? await context.params : context?.params;
  const id = params?.id as string;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const conv = await Conversation.findById(id);
  if (!conv || !authz(conv, session.user.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { text } = (await req.json()) as { text: string };
  const msg = (text || "").trim();
  if (!msg) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const senderId = new Types.ObjectId(session.user.id);
  await Message.create({ conversationId: conv._id, senderId, text: msg });

  // update conversation last state + unread for the other side
  const isBuyerSender = String(conv.buyerId) === String(senderId);
  await Conversation.updateOne(
    { _id: conv._id },
    {
      $set: { lastMessageAt: new Date(), lastMessageText: msg },
      $inc: isBuyerSender ? { providerUnread: 1 } : { buyerUnread: 1 },
    }
  );

  return NextResponse.json({ ok: true });
}
