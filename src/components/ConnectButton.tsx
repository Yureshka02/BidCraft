"use client";

import { Button, message } from "antd";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
  peerId: string; // buyerId or providerId
  label?: string;
};

export default function ConnectButton({ projectId, peerId, label }: Props) {
  const router = useRouter();

  const start = async () => {
    const res = await fetch("/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, peerId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      message.error(data.error || "Failed to start chat");
      return;
    }
    router.push(`/chat/${data.conversationId}`);
  };

  return (
    <Button type="primary" onClick={start}>
      {label ?? "Connect"}
    </Button>
  );
}
