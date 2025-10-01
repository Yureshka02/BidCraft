/**
 * Seed 3 accounts into bid_craft.users:
 *  - admin@bidcraft.app / Admin#12345 (ADMIN)
 *  - buyer@bidcraft.app / Buyer#12345 (BUYER)
 *  - provider@bidcraft.app / Provider#12345 (PROVIDER)
 *
 * Idempotent: updates role/status if the email already exists.
 */

import { config } from "dotenv";
config({ path: ".env.local" }); // loads MONGODB_URI, etc.

import bcrypt from "bcryptjs";

async function main() {
  // Import AFTER env is loaded
  const { dbConnect } = await import("../lib/mongoose");
  const { default: User } = await import("../models/User");

  await dbConnect();

  const users = [
    {
      email: "admin@bidcraft.app",
      password: "Admin#12345",
      role: "ADMIN",
      status: "ACTIVE",
    },
    {
      email: "buyer@bidcraft.app",
      password: "Buyer#12345",
      role: "BUYER",
      status: "ACTIVE",
    },
    {
      email: "provider@bidcraft.app",
      password: "Provider#12345",
      role: "PROVIDER",
      status: "ACTIVE",
    },
  ] as const;

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    const password_hash = await bcrypt.hash(u.password, 10);

    if (existing) {
      await User.updateOne(
        { _id: existing._id },
        { $set: { role: u.role, status: u.status, password_hash } }
      );
      console.log(`🔄 Updated: ${u.email} → ${u.role}`);
    } else {
      await User.create({
        email: u.email,
        password_hash,
        role: u.role,
        status: u.status,
      });
      console.log(`✅ Created: ${u.email} → ${u.role}`);
    }
  }

  console.log("🎯 Seeding complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
