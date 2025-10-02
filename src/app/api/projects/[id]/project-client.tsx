"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, Form, InputNumber, List, Statistic, Tag, Typography, message } from "antd";
import useSWR from "swr";
import { useSession } from "next-auth/react";

const { Countdown } = Statistic;

type Project = {
  _id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  category: string;
  buyerId: { _id: string; email: string; role: string };
  bids?: { providerId: string; amount: number; createdAt: string }[];
  acceptedBid?: { providerId: string; amount: number } | null;
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ProjectClient({ project }: { project: Project }) {
  const { data: session } = useSession();
  const isProvider = session?.user?.role === "PROVIDER";
  const isBuyer = session?.user?.role === "BUYER" && session.user.id === String(project.buyerId?._id);

  const deadlineMs = useMemo(() => new Date(project.deadline).getTime(), [project.deadline]);
  const isOpen = Date.now() < deadlineMs && !project.acceptedBid;

  // live bids
  const { data: bidsData, mutate } = useSWR<{ bids: any[]; deadline: string; acceptedBid: any }>(
    `/api/projects/${project._id}/bids`,
    fetcher,
    { refreshInterval: 5000 } // simple polling; can swap to websockets later
  );

  const bids = useMemo(() => (bidsData?.bids || []).sort((a, b) => a.amount - b.amount), [bidsData]);
  const lowest = bids.length ? bids[0].amount : null;

  // Submit bid
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onBid = async (vals: { amount: number }) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${project._id}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: vals.amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        message.error(data.error || "Failed to place bid");
        return;
      }
      message.success("Bid placed!");
      form.resetFields();
      mutate(); // refresh bids
    } catch {
      message.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Buyer accept bid (after deadline)
  const onAccept = async (providerId: string, amount: number) => {
    try {
      const res = await fetch(`/api/projects/${project._id}/accept`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        message.error(data.error || "Failed to accept bid");
        return;
      }
      message.success("Bid accepted!");
      mutate();
    } catch {
      message.error("Network error");
    }
  };

  useEffect(() => {
    if (!isOpen) mutate(); // refresh when closed
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
          renderItem={(b: any, idx) => (
            <List.Item
              actions={[
                isBuyer && Date.now() >= deadlineMs && !bidsData?.acceptedBid ? (
                  <Button key="accept" type="primary" onClick={() => onAccept(b.providerId, b.amount)}>
                    Accept
                  </Button>
                ) : null,
              ]}
            >
              <List.Item.Meta
                title={`₹${b.amount}${idx === 0 ? " (lowest)" : ""}`}
                description={new Date(b.createdAt).toLocaleString()}
              />
            </List.Item>
          )}
        />
      </Card>

      {isProvider && isOpen && (
        <Card title="Place your bid">
          <Form form={form} layout="inline" onFinish={onBid}>
            <Form.Item
              name="amount"
              rules={[
                { required: true, message: "Bid amount required" },
                () => ({
                  validator(_, value) {
                    if (value == null) return Promise.resolve();
                    if (value <= 0) return Promise.reject("Must be > 0");
                    if (lowest != null && value >= lowest) {
                      return Promise.reject(`Must be lower than current lowest (${lowest})`);
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber min={1} placeholder="Your bid" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Place Bid
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {!isProvider && !isBuyer && (
        <div className="text-sm text-gray-500">
          Log in as a <b>Provider</b> to place a bid.
        </div>
      )}
      {isBuyer && <div className="text-sm text-gray-500">You are the buyer of this project.</div>}
      {!isOpen && <div className="mt-2"><Tag color="red">Bidding closed</Tag></div>}
      {bidsData?.acceptedBid && <div className="mt-2"><Tag color="green">Bid accepted</Tag></div>}
    </div>
  );
}
