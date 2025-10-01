"use client";

import { Button, Typography } from "antd";
import { signOut } from "next-auth/react";

export default function AdminLanding() {
  return (
    <div className="max-w-2xl mx-auto mt-10 text-center">
      <Typography.Title level={2}>👑 Admin Dashboard</Typography.Title>
      <p>Welcome! Here you can manage users, revenue, and monitor the platform.</p>
      <Button danger onClick={() => signOut({ callbackUrl: "/" })}>
        Log Out
      </Button>
    </div>
  );
}
