import { NextResponse } from "next/server";

// Example GET handler for admin stats
export async function GET() {
  return NextResponse.json({
    users: 0,
    projects: 0,
    revenue: 0,
  });
}
