import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["BUYER","PROVIDER","ADMIN"], required: true, index: true },
  status: { type: String, enum: ["ACTIVE","BANNED"], default: "ACTIVE", index: true }
}, { timestamps: true });

export type UserRole = "BUYER" | "PROVIDER" | "ADMIN";
export type UserStatus = "ACTIVE" | "BANNED";

export default models.User || model("User", UserSchema);
