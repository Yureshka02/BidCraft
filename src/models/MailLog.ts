import mongoose, { Schema, models, model, Document, Types } from "mongoose";

export interface IMailLog extends Document {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  userId?: Types.ObjectId;
  meta?: Record<string, any>;
  createdAt: Date;
}

const MailLogSchema = new Schema<IMailLog>(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    html: String,
    text: String,
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

MailLogSchema.index({ createdAt: -1 });

export default models.MailLog || model<IMailLog>("MailLog", MailLogSchema);
