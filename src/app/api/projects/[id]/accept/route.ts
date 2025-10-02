export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import Project, { type IProject } from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "BUYER") {
      return NextResponse.json({ error: "Only buyers can accept bids" }, { status: 403 });
    }

    const projectId = params.id;
    if (!mongoose.isValidObjectId(projectId)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }

    const body = await req.json();
    const { providerId, amount } = body as { providerId: string; amount: number };

    if (!mongoose.isValidObjectId(providerId) || !Number.isFinite(Number(amount))) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const now = new Date();

    const updated = await Project.findOneAndUpdate(
      {
        _id: new Types.ObjectId(projectId),
        buyerId: new Types.ObjectId(session.user.id),
        acceptedBid: { $exists: false },
        deadline: { $lte: now }, // only AFTER deadline
        bids: {
          $elemMatch: {
            providerId: new Types.ObjectId(providerId),
            amount: Number(amount),
          },
        },
      },
      {
        $set: {
          acceptedBid: {
            providerId: new Types.ObjectId(providerId),
            amount: Number(amount),
          },
        },
      },
      { new: true }
    ).lean<IProject | null>();

    if (!updated) {
      return NextResponse.json(
        { error: "Cannot accept this bid. Check deadline/ownership/bid existence." },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true, acceptedBid: updated.acceptedBid ?? null });
  } catch (err) {
    console.error("PATCH /api/projects/[id]/accept error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
