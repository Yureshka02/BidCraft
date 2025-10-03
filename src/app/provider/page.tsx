"use client";

import useSWR from "swr";
import { Card, List, Typography, Tag, Space, Statistic, message } from "antd";
import ConnectButton from "@/components/ConnectButton";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => {
  if (!r.ok) throw new Error("Failed to load");
  return r.json();
});

export default function ProviderLanding() {
  const { data, isLoading, error } = useSWR<{ items: any[] }>("/api/provider/bids", fetcher);
  if (error) message.error("Failed to load your bid projects");

  const projects = data?.items ?? [];

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Typography.Title level={2}>Projects I Bid On</Typography.Title>

      <Space style={{ marginBottom: 12 }}>
        <Statistic title="Total" value={projects.length} />
      </Space>

      <List
        loading={isLoading}
        dataSource={projects}
        renderItem={(p: any) => {
          const myBid = (p.bids || []).find((b: any) => b.isMine) // optional if you tagged in API
          return (
            <List.Item style={{ border: "none" }}>
              <Card
                title={<span className="font-medium">{p.title}</span>}
                extra={<Tag>{p.category}</Tag>}
                className="w-full"
              >
                <div className="text-sm text-gray-600 mb-2">{p.description}</div>
                <div className="text-sm mb-2">
                  💰 Budget: USD{p.budgetMin} – USD{p.budgetMax} · 📅 Deadline:{" "}
                  {new Date(p.deadline).toLocaleString()}
                </div>

                <Space>
                  <ConnectButton
                    projectId={p._id}
                    peerId={p.buyerId}          // ← connect with the buyer
                    label="Connect with buyer"
                  />
                </Space>
              </Card>
            </List.Item>
          );
        }}
      />
    </div>
  );
}
