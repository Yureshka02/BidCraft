import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IConversation extends Document {
  projectId: Types.ObjectId;
  buyerId: Types.ObjectId;
  providerId: Types.ObjectId;
  lastMessageAt?: Date;
  lastMessageText?: string;
  buyerUnread: number;
  providerUnread: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastMessageAt: Date,
    lastMessageText: String,
    buyerUnread: { type: Number, default: 0 },
    providerUnread: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One conv per buyer+provider+project
ConversationSchema.index({ projectId: 1, buyerId: 1, providerId: 1 }, { unique: true });
// List “my chats” newest first
ConversationSchema.index({ buyerId: 1, updatedAt: -1 });
ConversationSchema.index({ providerId: 1, updatedAt: -1 });

export default models.Conversation || model<IConversation>("Conversation", ConversationSchema);
