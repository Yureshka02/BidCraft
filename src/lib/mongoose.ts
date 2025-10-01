import mongoose from "mongoose";

let cached: any = (global as any)._mongoose || { conn: null, promise: null };
(global as any)._mongoose = cached;

export async function dbConnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: "bid_craft",
      serverApi: { version: "1", strict: true, deprecationErrors: true },
      serverSelectionTimeoutMS: 15000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
