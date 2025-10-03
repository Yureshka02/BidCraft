export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import Conversation from "@/models/Conversation";
import Project from "@/models/Project";

export async function GET(req: NextRequest, context: any) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = typeof context?.params?.then === "function" ? await context.params : context?.params;
  const id = params?.id as string;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const conv = await Conversation.findById(id).lean() as any;
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const me = session.user.id;
  if (String(conv.buyerId) !== me && String(conv.providerId) !== me) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await Project.findById(conv.projectId).select({ title: 1 }).lean() as { title?: string } | null;

  return NextResponse.json({
    conversation: {
      _id: String(conv._id),
      projectId: String(conv.projectId),
      buyerId: String(conv.buyerId),
      providerId: String(conv.providerId),
      lastMessageAt: conv.lastMessageAt || null,
      lastMessageText: conv.lastMessageText || "",
      buyerUnread: conv.buyerUnread,
      providerUnread: conv.providerUnread,
      projectTitle: project?.title || "",
    },
  });
}
