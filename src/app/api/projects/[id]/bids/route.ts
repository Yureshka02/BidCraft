export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import Project, { type IProject } from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  await dbConnect();

  const projectId = params.id;
  if (!mongoose.isValidObjectId(projectId)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  // Ask for only the fields we need, and TELL TS the shape via lean<IProject>()
  const project = await Project.findById(projectId)
    .select({ bids: 1, deadline: 1, acceptedBid: 1 })
    .lean<IProject | null>();

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bids = [...(project.bids ?? [])].sort((a, b) => a.amount - b.amount);
  return NextResponse.json({
    bids,
    deadline: project.deadline,
    acceptedBid: project.acceptedBid ?? null,
  });
}

export async function POST(req: Request, { params }: Params) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Only providers can bid" }, { status: 403 });
    }

    const projectId = params.id;
    if (!mongoose.isValidObjectId(projectId)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }

    const { amount } = await req.json();
    const bidAmount = Number(amount);
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
      return NextResponse.json({ error: "Invalid bid amount" }, { status: 400 });
    }

    const now = new Date();
    const provId = new Types.ObjectId(session.user.id);

    // Try to push the bid only if all conditions hold atomically
    const updated = await Project.findOneAndUpdate(
      {
        _id: new Types.ObjectId(projectId),
        acceptedBid: { $exists: false },
        deadline: { $gt: now },
        buyerId: { $ne: provId },
        $expr: {
          $or: [
            { $eq: [{ $size: { $ifNull: ["$bids", []] } }, 0] },
            { $lt: [bidAmount, { $min: "$bids.amount" }] },
          ],
        },
      },
      { $push: { bids: { providerId: provId, amount: bidAmount, createdAt: now } } },
      { new: true }
    ).lean<IProject | null>();

    if (!updated) {
      // figure out why it failed, give a specific message
      const p = await Project.findById(projectId)
        .select({ deadline: 1, buyerId: 1, bids: 1, acceptedBid: 1 })
        .lean<IProject | null>();

      if (!p) return NextResponse.json({ error: "Project not found" }, { status: 404 });
      if (p.acceptedBid) return NextResponse.json({ error: "Project already has an accepted bid" }, { status: 409 });
      if (p.deadline <= now) return NextResponse.json({ error: "Bidding closed (deadline passed)" }, { status: 409 });
      if (String(p.buyerId) === String(provId)) {
        return NextResponse.json({ error: "Buyer cannot bid on own project" }, { status: 403 });
      }

      const currentLowest =
        (p.bids ?? []).reduce<number | null>(
          (min, b) => (min == null || b.amount < min ? b.amount : min),
          null
        );

      if (currentLowest != null && !(bidAmount < currentLowest)) {
        return NextResponse.json(
          { error: `Bid must be lower than current lowest (${currentLowest})` },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: "Unable to place bid" }, { status: 400 });
    }

    const bids = updated.bids ?? [];
    const bidsCount = bids.length;
    const lowestBid = bids.reduce<number | null>(
      (min, b) => (min == null || b.amount < min ? b.amount : min),
      null
    );

    return NextResponse.json({ ok: true, bidsCount, lowestBid });
  } catch (err) {
    console.error("POST /api/projects/[id]/bids error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
