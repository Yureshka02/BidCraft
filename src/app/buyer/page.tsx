"use client";

import useSWR from "swr";
import { Card, List, Typography, Tag, Space, Statistic, message, Button } from "antd";
import ConnectButton from "@/components/ConnectButton";
import { useRouter } from "next/navigation";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => {
    if (!r.ok) throw new Error("Failed to load");
    return r.json();
  });

export default function BuyerLanding() {
  const router = useRouter();
  const { data, isLoading, error } = useSWR<{ items: any[] }>("/api/buyer/projects", fetcher);
  if (error) message.error("Failed to load your projects");

  const projects = data?.items ?? [];

  return (
    <div className="max-w-5xl mx-auto p-15">
      <div className="flex items-center justify-between mb-6 ">
        <Typography.Title level={2}>My Projects</Typography.Title>
        <Button
          type="primary"
          className="bg-teal-500 border-teal-500 hover:bg-teal-600 hover:border-teal-600 text-white"
          onClick={() => router.push("/projects/new")}
        >
          + Post New Project
        </Button>
      </div>

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
                actions={[
                  <Button
                    key="view"
                    type="link"
                    onClick={() => router.push(`/projects/${p._id}`)}
                  >
                    View Details
                  </Button>,
                ]}
              >
                <div className="text-sm text-gray-600 mb-2">{p.description}</div>
                <div className="text-sm mb-2">
                  💰 Budget: ${p.budgetMin} – ${p.budgetMax} · 📅 Deadline:{" "}
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
                        <Tag color="blue">${b.amount}</Tag>
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
