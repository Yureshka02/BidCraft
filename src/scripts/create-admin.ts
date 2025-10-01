// src/scripts/create-admin.ts
import { config } from "dotenv";
config({ path: ".env.local" }); // falls back to .env if you prefer

// now import after env is loaded
import bcrypt from "bcryptjs";

(async () => {
  const { dbConnect } = await import("../lib/mongoose");
  const { default: User } = await import("../models/User");

  await dbConnect();

  const email = "admin@yourapp.com";
  const password_hash = await bcrypt.hash("Admin#12345", 10);

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    await User.updateOne({ email }, { $set: { role: "ADMIN", status: "ACTIVE" } });
    console.log("Promoted existing user to ADMIN");
  } else {
    await User.create({ email, password_hash, role: "ADMIN", status: "ACTIVE" });
    console.log("Created ADMIN user");
  }
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
