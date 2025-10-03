"use client";

import useSWR from "swr";
import { Card, List, Typography, Tag, Space, Statistic, message } from "antd";
import ConnectButton from "@/components/ConnectButton";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => {
  if (!r.ok) throw new Error("Failed to load");
  return r.json();
});

export default function BuyerLanding() {
  const { data, isLoading, error } = useSWR<{ items: any[] }>("/api/buyer/projects", fetcher);
  if (error) message.error("Failed to load your projects");

  const projects = data?.items ?? [];

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Typography.Title level={2}>My Projects</Typography.Title>

      <Space style={{ marginBottom: 12 }}>
        <Statistic title="Total" value={projects.length} />
      </Space>

      <List
        loading={isLoading}
        dataSource={projects}
        renderItem={(p: any) => {
          const bids = p.bids || [];
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

                <Typography.Text strong>Bids</Typography.Text>
                <List
                  size="small"
                  dataSource={bids.sort((a: any, b: any) => a.amount - b.amount)}
                  locale={{ emptyText: "No bids yet" }}
                  renderItem={(b: any) => (
                    <List.Item
                      actions={[
                        <ConnectButton
                          key="c"
                          projectId={p._id}
                          peerId={b.providerId}
                          label="Connect with provider"
                        />,
                      ]}
                    >
                      <Space>
                        <Tag color="blue">USD{b.amount}</Tag>
                        <span className="text-xs text-gray-600">
                          {new Date(b.createdAt).toLocaleString()}
                        </span>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </List.Item>
          );
        }}
      />
    </div>
  );
}
