"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Table, Input, Select, Space, Tag, Typography, Statistic, message, Button } from "antd";
import { useSession } from "next-auth/react";

const { Countdown } = Statistic;

type ProjectRow = {
  _id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string; // ISO string
  category: string;
  buyerEmail?: string;
  bidsCount: number;
  lowestBid?: number | null;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiRes = {
  items: ProjectRow[];
  total: number;
  page: number;
  pageSize: number;
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    const body = ct.includes("application/json") ? await res.json() : await res.text();
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return res.json();
};

export default function ProjectsOverviewPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // Table state
  const [page, setPage] = useState(1);
  const [pageSize, setPgSize] = useState(10);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<
    "createdAt" | "deadline" | "budgetMax" | "budgetMin" | "bidsCount" | "lowestBid"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("descend");

  const qs = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (category) params.set("category", category);
    if (q.trim()) params.set("q", q.trim());
    params.set("sortKey", sortKey);
    params.set("sortOrder", sortOrder);
    return params.toString();
  }, [page, pageSize, category, q, sortKey, sortOrder]);

  // ✅ Use the overview API (supports filters/sort/pagination)
  const DATA_URL = `/api/projects/overview?${qs}`;
  const { data, isLoading, error } = useSWR<ApiRes>(DATA_URL, fetcher, {
    keepPreviousData: true,
    onError: (err) => message.error(err.message),
  });

  const columns = [
    {
      title: "Project",
      dataIndex: "title",
      key: "title",
      render: (_: any, r: ProjectRow) => (
        <div>
          <Link href={`/projects/${r._id}`} className="font-medium hover:underline">
            {r.title}
          </Link>
          <div className="text-xs text-gray-500 truncate max-w-[420px]">{r.description}</div>
        </div>
      ),
      width: 360,
    },
    {
      title: "Buyer",
      dataIndex: "buyerEmail",
      key: "buyerEmail",
      render: (v: string) => v || "-",
      width: 220,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (v: string) => <Tag>{v}</Tag>,
      width: 120,
    },
    {
      title: "Budget",
      key: "budget",
      render: (_: any, r: ProjectRow) => `$${r.budgetMin} – $${r.budgetMax}`,
      width: 160,
    },
    {
      title: "Bids",
      dataIndex: "bidsCount",
      key: "bidsCount",
      width: 90,
    },
    {
      title: "Lowest Bid",
      dataIndex: "lowestBid",
      key: "lowestBid",
      width: 120,
      render: (v: number | null | undefined) => (v != null ? `USD${v}` : "—"),
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      width: 230,
      render: (iso: string) => (
        <Space direction="vertical" size={0}>
          <span className="text-xs">{new Date(iso).toLocaleString()}</span>
          <Countdown value={new Date(iso).getTime()} format="D[d] HH[h] mm[m] ss[s]" />
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "isOpen",
      key: "isOpen",
      width: 110,
      render: (v: boolean) =>
        v ? <Tag color="green">Open</Tag> : <Tag color="red">Closed</Tag>,
    },
    // 👇 New column for bidding button (only Providers see it)
    {
      title: "Action",
      key: "action",
      render: (_: any, r: ProjectRow) =>
        userRole === "PROVIDER" && r.isOpen ? (
          <Link href={`/projects/${r._id}/bid`}>
            <Button type="primary" size="small">
              Place Bid
            </Button>
          </Link>
        ) : null,
      width: 150,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-8 p-2">
      <Typography.Title level={3}>Marketplace</Typography.Title>

      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search
          allowClear
          placeholder="Search title/description"
          onSearch={(val) => {
            setQ(val);
            setPage(1);
          }}
          style={{ width: 320 }}
        />
        <Select
          allowClear
          placeholder="Category"
          style={{ width: 200 }}
          value={category}
          onChange={(val) => {
            setCategory(val);
            setPage(1);
          }}
          options={[
            { value: "design", label: "Design" },
            { value: "writing", label: "Writing" },
            { value: "coding", label: "Coding" },
          ]}
        />
      </Space>

      <Table<ProjectRow>
        rowKey="_id"
        columns={columns as any}
        dataSource={data?.items || []}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p);
            setPgSize(ps);
          },
        }}
      />

      {error ? (
        <div style={{ marginTop: 8, color: "crimson" }}>
          Error: {String(error.message || error)}
        </div>
      ) : null}
    </div>
  );
}
