"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Button, Card, Form, InputNumber, List, Statistic, Tag, Typography, message } from "antd";

const { Countdown } = Statistic;

type Bid = { providerId: string; amount: number; createdAt: string };
type AcceptedBid = { providerId: string; amount: number } | null;

type Project = {
  _id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  category: string;
  buyerId?: { _id: string; email: string; role: string } | string;
  acceptedBid?: AcceptedBid;
};

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then(r => r.json());

export default function ProjectClient({ project }: { project: Project }) {
  const { data: session } = useSession();
  const isProvider = session?.user?.role === "PROVIDER";
  const isBuyer = session?.user?.role === "BUYER" &&
    typeof project.buyerId === "object" &&
    session.user.id === (project.buyerId as any)?._id;

  const deadlineMs = useMemo(() => new Date(project.deadline).getTime(), [project.deadline]);

  const { data, mutate } = useSWR<{ bids: Bid[]; deadline: string; acceptedBid: AcceptedBid }>(
    `/api/projects/${project._id}/bids`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const bids = useMemo(() => (data?.bids || []).slice().sort((a, b) => a.amount - b.amount), [data]);
  const lowest = bids.length ? bids[0].amount : null;
  const isOpen = Date.now() < deadlineMs && !data?.acceptedBid;

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const placeBid = async (vals: { amount: number }) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${project._id}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: vals.amount }),
      });
      const json = await res.json();
      if (!res.ok) return message.error(json.error || "Failed to place bid");
      message.success("Bid placed!");
      form.resetFields();
      mutate();
    } catch {
      message.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const acceptBid = async (providerId: string, amount: number) => {
    const res = await fetch(`/api/projects/${project._id}/accept`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, amount }),
    });
    const json = await res.json();
    if (!res.ok) return message.error(json.error || "Failed to accept bid");
    message.success("Bid accepted!");
    mutate();
  };

  useEffect(() => {
    if (!isOpen) mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-2">
      <Typography.Title level={3}>{project.title}</Typography.Title>
      <p className="mb-2">{project.description}</p>
      <div className="mb-2">💰 Budget: {project.budgetMin} – {project.budgetMax}</div>
      <div className="mb-2">📂 Category: <Tag>{project.category}</Tag></div>
      <div className="mb-4">
        <span className="block text-xs text-gray-500">Deadline</span>
        <Countdown value={deadlineMs} format="D[d] HH[h] mm[m] ss[s]" />
      </div>

      <Card title="Bids" className="mb-6">
        <List
          dataSource={bids}
          locale={{ emptyText: "No bids yet" }}
          renderItem={(b, idx) => (
            <List.Item
              actions={[
                isBuyer && Date.now() >= deadlineMs && !data?.acceptedBid ? (
                  <Button key="accept" type="primary" onClick={() => acceptBid(b.providerId, b.amount)}>
                    Accept
                  </Button>
                ) : null,
              ]}
            >
              <List.Item.Meta
                title={`$${b.amount}${idx === 0 ? " (lowest)" : ""}`}
                description={new Date(b.createdAt).toLocaleString()}
              />
            </List.Item>
          )}
        />
      </Card>

      {isProvider && isOpen && (
        <Card title="Place your bid">
          <Form form={form} layout="inline" onFinish={placeBid}>
            <Form.Item
              name="amount"
              rules={[
                { required: true, message: "Enter your bid amount" },
                {
                  validator: (_, value) => {
                    if (value == null) return Promise.resolve();
                    if (value <= 0) return Promise.reject("Must be > 0");
                    if (lowest != null && value >= lowest) {
                      return Promise.reject(`Must be lower than current lowest (${lowest})`);
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber min={1} placeholder="Your bid ($)" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Place Bid
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {!isProvider && !isBuyer && <div className="text-sm text-gray-500">Log in as a <b>Provider</b> to bid.</div>}
      {isBuyer && <div className="text-sm text-gray-500">You are the buyer of this project.</div>}
      {!isOpen && <div className="mt-2"><Tag color="red">Bidding closed</Tag></div>}
      {data?.acceptedBid && <div className="mt-2"><Tag color="green">Bid accepted</Tag></div>}
    </div>
  );
}
