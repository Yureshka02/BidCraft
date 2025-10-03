export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";
import mongoose, { Types } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import Project, { type IProject } from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";

/**
 * GET (recommended) – return current bids + deadline + acceptedBid
 * If you previously used PATCH here, you can keep PATCH as an alias,
 * but GET semantics are a better fit for "read".
 */
export async function GET(req: NextRequest, context: any) {
  await dbConnect();

  const _UserForBids = User;
  const params =
    context?.params && typeof context.params.then === "function"
      ? await context.params
      : context?.params;

  const projectId = params?.id as string | undefined;
  if (!projectId || !mongoose.isValidObjectId(projectId)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

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

// If you still want PATCH to behave like GET (back-compat), keep this:
export const PATCH = GET;

/**
 * POST – place a bid (providers only)
 */
export async function POST(req: NextRequest, context: any) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Only providers can bid" }, { status: 403 });
    }

    const params =
      context?.params && typeof context.params.then === "function"
        ? await context.params
        : context?.params;

    const projectId = params?.id as string | undefined;
    if (!projectId || !mongoose.isValidObjectId(projectId)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }

    const { amount } = (await req.json()) as { amount: number };
    const bidAmount = Number(amount);
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
      return NextResponse.json({ error: "Invalid bid amount" }, { status: 400 });
    }

    const now = new Date();
    const provId = new Types.ObjectId(session.user.id);

    // Atomically push bid only if conditions hold
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
      // Diagnose why it failed for a precise message
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
