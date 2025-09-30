import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// cache across hot-reloads in dev and across Lambdas in prod
let cached = (global as any)._mongoose as GlobalMongoose;
if (!cached) {
  cached = (global as any)._mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    // You can pass options here (Mongoose 8 has sane defaults)
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: "marketplace" });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Optional: enable query logs during dev
// if (process.env.NODE_ENV === "development") mongoose.set("debug", true);
