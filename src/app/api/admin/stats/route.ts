export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import Project from "@/models/Project";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Users: totals, by role, by status
  const [userCounts, usersByRole, usersByStatus] = await Promise.all([
    User.countDocuments({}),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    User.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  // Projects totals
  const now = new Date();
  // Open = deadline future AND not accepted
  // Closed = deadline passed OR acceptedBid exists
  const [projectsTotal, projectsOpen, projectsClosed, projectsByCategory] = await Promise.all([
    Project.countDocuments({}),
    Project.countDocuments({ deadline: { $gt: now }, acceptedBid: { $exists: false } }),
    Project.countDocuments({ $or: [{ deadline: { $lte: now } }, { acceptedBid: { $exists: true } }] }),
    Project.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
  ]);

  return NextResponse.json({
    users: {
      total: userCounts,
      byRole: Object.fromEntries(usersByRole.map(r => [r._id, r.count])),
      byStatus: Object.fromEntries(usersByStatus.map(s => [s._id, s.count])),
    },
    projects: {
      total: projectsTotal,
      open: projectsOpen,
      closed: projectsClosed,
      byCategory: Object.fromEntries(projectsByCategory.map(c => [c._id, c.count])),
    },
    asOf: now.toISOString(),
  });
}
