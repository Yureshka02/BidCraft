export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import mongoose, { Types } from "mongoose";
import Conversation from "@/models/Conversation";
import Project from "@/models/Project";

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const meId = new Types.ObjectId(session.user.id);
  const { projectId, peerId } = (await req.json()) as { projectId: string; peerId: string };

  if (!mongoose.isValidObjectId(projectId) || !mongoose.isValidObjectId(peerId)) {
    return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  }

  const project = await Project.findById(projectId).select({ buyerId: 1 }).lean() as { buyerId: Types.ObjectId } | null;
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Determine roles based on who calls
  const isBuyer = String(project.buyerId) === String(meId);
  const buyerId = isBuyer ? meId : new Types.ObjectId(peerId);
  const providerId = isBuyer ? new Types.ObjectId(peerId) : meId;

  // Ensure peer is not me and that peer makes sense
  if (String(buyerId) === String(providerId)) {
    return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });
  }

  // Upsert conversation
  const conv = await Conversation.findOneAndUpdate(
    { projectId, buyerId, providerId },
    { $setOnInsert: { buyerUnread: 0, providerUnread: 0 } },
    { new: true, upsert: true }
  ).lean();

  if (!conv || Array.isArray(conv)) {
    return NextResponse.json({ error: "Failed to create or find conversation" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, conversationId: String((conv as { _id: Types.ObjectId })._id) });
}
