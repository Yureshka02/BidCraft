"use client";

import useSWR from "swr";
import { useState, useEffect, useRef } from "react";
import { Button, Input, List, Typography, message, Space } from "antd";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then(r => r.json());
const { Text } = Typography;

export default function ChatClient({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const myId = session?.user?.id;

  // Conversation meta (auth check & header)
  const { data: meta, error: metaErr } = useSWR(`/api/chat/${conversationId}`, fetcher);
  useEffect(() => {
    if (metaErr && (metaErr as any).status === 403) router.replace("/"); // forbidden
  }, [metaErr, router]);

  // Messages polling with cursor
  const [cursor, setCursor] = useState<string | null>(null);
  const { data: msgRes, mutate } = useSWR(
    `/api/chat/${conversationId}/messages?limit=50${cursor ? `&cursor=${cursor}` : ""}`,
    fetcher,
    { refreshInterval: 1500 }
  );

  // Auto-scroll down when new messages arrive
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgRes]);

  // Mark-read on open
  useEffect(() => {
    fetch(`/api/chat/${conversationId}/read`, { method: "PATCH" }).catch(() => {});
  }, [conversationId]);

  const [text, setText] = useState("");
  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setText("");
    const res = await fetch(`/api/chat/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: t }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      message.error(data.error || "Failed to send");
      return;
    }
    mutate(); // refresh messages
  };

  const msgs = msgRes?.items || [];

  return (
    <div className="max-w-3xl mx-auto mt-6 p-4 bg-white rounded shadow min-h-[70vh] flex flex-col">
      <Space style={{ justifyContent: "space-between", width: "100%", marginBottom: 8 }}>
        <Text strong>{meta?.conversation?.projectTitle || "Chat"}</Text>
        <Button onClick={() => router.back()}>Exit</Button>
      </Space>

      <div className="flex-1 overflow-y-auto border rounded p-3 bg-gray-50">
        <List
          dataSource={msgs}
          renderItem={(m: any) => (
            <List.Item style={{ border: "none", padding: "6px 0" }}>
              <div
                className={`px-3 py-2 rounded ${
                  m.senderId === myId ? "bg-blue-100 ml-auto" : "bg-white"
                } max-w-[75%]`}
              >
                <div className="text-sm">{m.text}</div>
                <div className="text-[11px] text-gray-500 mt-1">
                  {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
            </List.Item>
          )}
        />
        <div ref={endRef} />
      </div>

      <Space.Compact style={{ marginTop: 8 }}>
        <Input.TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          autoSize={{ minRows: 2, maxRows: 4 }}
          placeholder="Type a message…"
          style={{ width: "100%" }}
        />
        <Button type="primary" onClick={send}>Send</Button>
      </Space.Compact>
    </div>
  );
}
