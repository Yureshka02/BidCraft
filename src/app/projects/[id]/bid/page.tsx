"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Card, Typography, Statistic, Form, InputNumber, Button, message, Alert, Space } from "antd";
import Link from "next/link";

const { Title, Paragraph, Text } = Typography;
const { Countdown } = Statistic;

type BidsRes = {
  bids: { providerId: string; amount: number; createdAt: string }[];
  deadline: string;
  acceptedBid: { providerId: string; amount: number } | null;
};

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then(r => r.json());

export default function BidPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const isProvider = session?.user?.role === "PROVIDER";

  // Fetch current bids/deadline
  const { data, isLoading, error, mutate } = useSWR<BidsRes>(
    params?.id ? `/api/projects/${params.id}/bids` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const deadlineMs = useMemo(() => (data?.deadline ? new Date(data.deadline).getTime() : 0), [data]);
  const isOpen = useMemo(() => Date.now() < deadlineMs && !data?.acceptedBid, [deadlineMs, data]);

  const lowest = useMemo(() => {
    const sorted = (data?.bids || []).slice().sort((a, b) => a.amount - b.amount);
    return sorted.length ? sorted[0].amount : null;
  }, [data]);

  const onSubmit = async (vals: { amount: number }) => {
    if (!params?.id) return;
    if (!isOpen) {
      message.error("Bidding is closed for this project.");
      return;
    }
    if (lowest != null && vals.amount >= lowest) {
      message.error(`Your bid must be lower than the current lowest ($${lowest}).`);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${params.id}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: vals.amount }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error || "Failed to place bid");
        return;
      }
      message.success("✅ Bid placed!");
      await mutate();            // refresh bids list
      router.push(`/projects/${params.id}`); // back to project detail (or keep on page if you prefer)
    } catch {
      message.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Session/loading guards
  if (status === "loading") {
    return <div className="max-w-2xl mx-auto mt-10 p-4">Loading session…</div>;
  }
  if (!isProvider) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-4">
        <Alert
          type="warning"
          message="Providers only"
          description="You must be logged in as a Provider to place bids."
          showIcon
        />
        <div className="mt-4">
          <Link href="/login">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-2">
      <Space direction="vertical" size="large" className="w-full">
        <div>
          <Title level={3}>Place Your Bid</Title>
          <Paragraph type="secondary">
            Your bid must be <Text strong>lower</Text> than the current lowest bid (if any) and before the deadline.
          </Paragraph>
        </div>

        <Card>
          <Space direction="vertical">
            <div>
              <Text type="secondary">Deadline</Text>
              <div>
                <Countdown value={deadlineMs} format="D[d] HH[h] mm[m] ss[s]" />
              </div>
            </div>
            <div>
              <Text type="secondary">Current lowest</Text>
              <div><Text strong>{lowest != null ? `$${lowest}` : "— no bids yet —"}</Text></div>
            </div>
          </Space>
        </Card>

        {error ? (
          <Alert type="error" showIcon message="Failed to load bids" />
        ) : null}

        {!isOpen ? (
          <Alert
            type="warning"
            showIcon
            message={data?.acceptedBid ? "A bid has been accepted" : "Bidding is closed (deadline passed)"}
          />
        ) : (
          <Card title="Your Bid">
            <Form form={form} layout="inline" onFinish={onSubmit}>
              <Form.Item
                name="amount"
                rules={[
                  { required: true, message: "Enter your bid amount" },
                  {
                    validator: (_, value) => {
                      if (value == null) return Promise.resolve();
                      if (value <= 0) return Promise.reject("Amount must be greater than 0");
                      if (lowest != null && value >= lowest) {
                        return Promise.reject(`Must be less than $${lowest}`);
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber min={1} placeholder="Amount ($)" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Place Bid
                </Button>
              </Form.Item>
              <Form.Item>
                <Link href={`/projects/${params.id}`}>Back to project</Link>
              </Form.Item>
            </Form>
          </Card>
        )}
      </Space>
    </div>
  );
}
