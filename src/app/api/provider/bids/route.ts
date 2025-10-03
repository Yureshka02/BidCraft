export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import Project from "@/models/Project";
import mongoose from "mongoose";

export async function GET(_req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const providerId = new mongoose.Types.ObjectId(session.user.id);

  const items = await Project.find({ "bids.providerId": providerId })
    .select({
      title: 1,
      description: 1,
      budgetMin: 1,
      budgetMax: 1,
      deadline: 1,
      category: 1,
      buyerId: 1,
      bids: 1,
      acceptedBid: 1,
      createdAt: 1,
    })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ items });
}
