"use client";

import { Button, Typography } from "antd";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function BuyerLanding() {
  return (
    <div className="max-w-2xl mx-auto mt-10 text-center">
      <Typography.Title level={2}>🛒 Buyer Dashboard</Typography.Title>
      <p>Post new projects and review provider bids.</p>
      <div className="mt-4 space-x-4">
        <Link href="/projects/new">
          <Button type="primary">Post Project</Button>
        </Link>
        <Link href="/projects">
          <Button>View Projects</Button>
        </Link>
      </div>
      <div className="mt-6">
        <Button danger onClick={() => signOut({ callbackUrl: "/" })}>
          Log Out
        </Button>
      </div>
    </div>
  );
}
