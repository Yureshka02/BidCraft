import mongoose, { Schema, Document, models, model, Types } from "mongoose";
import "@/models/User"; 

export type Bid = {
  providerId: Types.ObjectId;
  amount: number;
  createdAt: Date;
};

export interface IProject extends Document {
  buyerId: Types.ObjectId;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: Date;
  category: string;
  bids: Bid[];
  acceptedBid?: {
    providerId: Types.ObjectId;
    amount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BidSchema = new Schema<Bid>(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: {
      type: Number,
      required: true,
      min: [0, "Bid amount must be > 0"],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AcceptedBidSchema = new Schema(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: {
      type: Number,
      required: true,
      min: [0, "Accepted amount must be > 0"],
    },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    budgetMin: { type: Number, required: true, min: [0, "budgetMin must be >= 0"] },
    budgetMax: { type: Number, required: true, min: [0, "budgetMax must be >= 0"] },
    deadline: { type: Date, required: true },
    category: { type: String, required: true, trim: true },
    bids: {
      type: [BidSchema],
      default: [], // ✅ ensures bids is always an array
    },
    acceptedBid: {
      type: AcceptedBidSchema,
      required: false,
    },
  },
  { timestamps: true }
);

// Schema-level validation: budgetMin <= budgetMax
ProjectSchema.pre("validate", function (next) {
  if (this.budgetMin != null && this.budgetMax != null && this.budgetMin > this.budgetMax) {
    return next(new Error("budgetMin cannot be greater than budgetMax"));
  }
  next();
});

// Helpful indexes
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ deadline: 1 });
ProjectSchema.index({ category: 1, deadline: 1 });
ProjectSchema.index({ buyerId: 1, createdAt: -1 });
// For fast "current lowest" checks
ProjectSchema.index({ _id: 1, "bids.amount": 1 });

const Project = models.Project || model<IProject>("Project", ProjectSchema);
export default Project;
