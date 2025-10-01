import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Project from "@/models/Project";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);

  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
  const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "10"), 1), 50);
  const category = searchParams.get("category") || "";
  const q = (searchParams.get("q") || "").trim();
  const sortKey = searchParams.get("sortKey") || "createdAt"; // createdAt|deadline|budgetMax|budgetMin|bidsCount|lowestBid
  const sortOrder = (searchParams.get("sortOrder") || "descend") as "ascend" | "descend";
  const dir: 1 | -1 = sortOrder === "ascend" ? 1 : -1;

  const match: Record<string, unknown> = {};
  if (category) match.category = category;
  if (q) {
    match.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  const pipeline: mongoose.PipelineStage[] = [
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "buyerId",
        foreignField: "_id",
        as: "buyer",
        pipeline: [{ $project: { email: 1, role: 1 } }],
      },
    },
    {
      $addFields: {
        buyerEmail: { $arrayElemAt: ["$buyer.email", 0] },
        bidsCount: { $size: { $ifNull: ["$bids", []] } },
        lowestBid: {
          $min: {
            $map: {
              input: { $ifNull: ["$bids", []] },
              as: "b",
              in: "$$b.amount",
            },
          },
        },
        isOpen: { $gt: ["$deadline", new Date()] },
      },
    },
    {
      $project: {
        buyer: 0,
        __v: 0,
        "bids.providerId": 0,
      },
    },
  ];

  if (["bidsCount", "lowestBid"].includes(sortKey)) {
    pipeline.push({ $sort: { [sortKey]: dir, _id: 1 } });
  } else if (["createdAt", "deadline", "budgetMax", "budgetMin"].includes(sortKey)) {
    pipeline.push({ $sort: { [sortKey]: dir, _id: 1 } });
  } else {
    pipeline.push({ $sort: { createdAt: -1, _id: 1 } });
  }

  pipeline.push({
    $facet: {
      items: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
      total: [{ $count: "count" }],
    },
  });

  const [res] = await Project.aggregate(pipeline);
  const items = res?.items ?? [];
  const total = res?.total?.[0]?.count ?? 0;

  return NextResponse.json({ items, total, page, pageSize });
}
