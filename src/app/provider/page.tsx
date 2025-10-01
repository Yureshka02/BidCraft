"use client";

import { Button, Typography } from "antd";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function ProviderLanding() {
  return (
    <div className="max-w-2xl mx-auto mt-10 text-center">
      <Typography.Title level={2}>🔧 Provider Dashboard</Typography.Title>
      <p>Browse projects and place competitive bids.</p>
      <div className="mt-4">
        <Link href="/projects">
          <Button type="primary">Browse Projects</Button>
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
