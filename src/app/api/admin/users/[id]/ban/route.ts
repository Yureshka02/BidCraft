export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import MailLog from "@/models/MailLog";
import { sendMail } from "@/lib/mailer";

type Params = { params: { id: string } };

// PATCH { action: "BAN" | "UNBAN", reason?: string }
export async function PATCH(req: Request, { params }: Params) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userId = params.id;
    if (!mongoose.isValidObjectId(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const { action, reason } = await req.json() as { action: "BAN" | "UNBAN"; reason?: string };

    const user = await User.findById(userId).select({ email: 1, role: 1, status: 1 }).lean<{ email: string; role: string; status: string }>();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const nextStatus = action === "BAN" ? "BANNED" : "ACTIVE";
    if (user.status === nextStatus) {
      return NextResponse.json({ ok: true, status: nextStatus }); // idempotent
    }

    await User.updateOne({ _id: userId }, { $set: { status: nextStatus } });

    // Send email (best-effort; still log the attempt/result)
    const subject =
      action === "BAN"
        ? "Your BidCraft account has been suspended"
        : "Your BidCraft account has been reinstated";
    const html =
      action === "BAN"
        ? `<p>Hello,</p><p>Your account has been <b>suspended</b>${reason ? ` for the following reason: <i>${reason}</i>` : ""}.</p><p>If you believe this was in error, reply to this email.</p>`
        : `<p>Hello,</p><p>Your account has been <b>reinstated</b>. You can log in again.</p>`;

    let mailError: string | undefined;
    try {
      await sendMail({ to: user.email, subject, html });
    } catch (e: any) {
      console.error("[ban mail] sendMail error:", e?.message || e);
      mailError = e?.message || "sendMail failed";
    }

    await MailLog.create({
      to: user.email,
      subject,
      html,
      userId: new Types.ObjectId(userId),
      meta: { action, reason, mailError: mailError || null },
    });

    return NextResponse.json({ ok: true, status: nextStatus, mailError: mailError || null });
  } catch (err) {
    console.error("PATCH /api/admin/users/[id]/ban error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
