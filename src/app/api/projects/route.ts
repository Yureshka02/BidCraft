import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";

const _UserForRoot = User;

export async function GET() {
  await dbConnect();
  const projects = await Project.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "BUYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title,
    description,
    budgetMin,
    budgetMax,
    deadline,
    category,
  } = body;

  // quick validation
  if (!title || !description || !budgetMin || !budgetMax || !deadline || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const project = await Project.create({
    buyerId: session.user.id,
    title,
    description,
    budgetMin: Number(budgetMin),
    budgetMax: Number(budgetMax),
    deadline: new Date(deadline),
    category,
    bids: [],
  });

  return NextResponse.json(project, { status: 201 });
}
