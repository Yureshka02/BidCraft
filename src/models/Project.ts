import mongoose, { Schema, Document, models } from "mongoose";

export interface IProject extends Document {
  buyerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: Date;
  category: string;
  bids: {
    providerId: mongoose.Types.ObjectId;
    amount: number;
    createdAt: Date;
  }[];
  acceptedBid?: {
    providerId: mongoose.Types.ObjectId;
    amount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    deadline: { type: Date, required: true },
    category: { type: String, required: true },
    bids: [
      {
        providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    acceptedBid: {
      providerId: { type: Schema.Types.ObjectId, ref: "User" },
      amount: Number,
    },
  },
  { timestamps: true }
);

export default models.Project || mongoose.model<IProject>("Project", ProjectSchema);
