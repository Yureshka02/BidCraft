export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";
import mongoose, { Types } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import Project, { type IProject } from "@/models/Project";
import User from "@/models/User";
import MailLog from "@/models/MailLog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";



export async function PATCH(req: NextRequest, context: any) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "BUYER") {
      return NextResponse.json({ error: "Only buyers can accept bids" }, { status: 403 });
    }

    const projectId = context.params.id;
    if (!mongoose.isValidObjectId(projectId)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }

    const body = await req.json();
    const { providerId, amount } = body as { providerId: string; amount: number };

    if (!mongoose.isValidObjectId(providerId) || !Number.isFinite(Number(amount))) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const now = new Date();

    // Accept the bid only if project is owned by buyer, past deadline, no acceptedBid yet
    const updated = await Project.findOneAndUpdate(
      {
        _id: new Types.ObjectId(projectId),
        buyerId: new Types.ObjectId(session.user.id),
        acceptedBid: { $exists: false },
        deadline: { $lte: now },
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

    // Fetch provider email
    const provider = await User.findById(providerId).select("email").lean<{ email?: string }>();
    if (!provider?.email) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    // Setup mail transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = "🎉 Your bid was accepted on BidCraft";
    const text = `Congrats! Your bid of $${amount} for project "${updated.title}" was accepted.`;
    const html = `
      <div style="font-family: Arial, sans-serif">
        <h2>🎉 Your bid was accepted</h2>
        <p>Project: <b>${updated.title}</b></p>
        <p>Accepted amount: <b>$${amount}</b></p>
        <p>Please log in to BidCraft to connect with the buyer.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: provider.email,
      subject,
      text,
      html,
    });

    // Log the mail
    await MailLog.create({
      to: provider.email,
      subject,
      text,
      html,
      userId: new Types.ObjectId(providerId),
      meta: {
        event: "ACCEPTED_BID",
        accepted: true,
        buyerId: new Types.ObjectId(session.user.id),
        providerId: new Types.ObjectId(providerId),
        projectId: new Types.ObjectId(projectId),
        amount,
        projectTitle: updated.title,
      },
    });

    return NextResponse.json({
      ok: true,
      acceptedBid: updated.acceptedBid ?? null,
      message: "Bid accepted, provider notified by email",
    });
  } catch (err) {
    console.error("PATCH /api/projects/[id]/accept error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
