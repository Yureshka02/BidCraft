import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

interface Cached {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extend the global object to safely store our cached connection
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: Cached | undefined;
}

let cached: Cached = global.mongooseCache || { conn: null, promise: null };

export async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  cached.conn = await cached.promise;
  global.mongooseCache = cached;

  return cached.conn;
}