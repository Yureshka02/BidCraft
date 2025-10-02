"use client";

import useSWR from "swr";
import { Card, Col, Row, Statistic, Typography, message, Table, Tag, Input, Button, Space, Popconfirm } from "antd";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useMemo, useState } from "react";

const { Title } = Typography;
const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then(r => r.json());

type StatsRes = {
  users: {
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
  };
  projects: {
    total: number;
    open: number;
    closed: number;
    byCategory: Record<string, number>;
  };
  asOf: string;
};

type UserRow = {
  _id: string;
  email: string;
  role: "ADMIN" | "BUYER" | "PROVIDER";
  status: "ACTIVE" | "BANNED";
  createdAt: string;
};

export default function AdminClient() {
  // --- Stats ---
  const { data: stats, isLoading: statsLoading, error: statsError, mutate: mutateStats } =
    useSWR<StatsRes>("/api/admin/stats", fetcher);

  // --- Users list ---
  const [page, setPage] = useState(1);
  const [ps, setPs] = useState(10);
  const [q, setQ] = useState("");

  const usersURL = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("pageSize", String(ps));
    if (q.trim()) p.set("q", q.trim());
    return `/api/admin/users?${p.toString()}`;
  }, [page, ps, q]);

  const { data: usersRes, isLoading: usersLoading, mutate: mutateUsers } =
    useSWR<{ items: UserRow[]; total: number; page: number; pageSize: number }>(usersURL, fetcher);

  const rolePie = useMemo(() => {
    const obj = stats?.users.byRole || {};
    return Object.keys(obj).map((k) => ({ name: k, value: obj[k] }));
  }, [stats]);

  const statusPie = useMemo(() => {
    const obj = stats?.users.byStatus || {};
    return Object.keys(obj).map((k) => ({ name: k, value: obj[k] }));
  }, [stats]);

  const categoryBar = useMemo(() => {
    const obj = stats?.projects.byCategory || {};
    return Object.keys(obj).map((k) => ({ category: k, count: obj[k] }));
  }, [stats]);

  const COLORS = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#0099C6"];

  const onBanToggle = async (id: string, action: "BAN" | "UNBAN") => {
    try {
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: action === "BAN" ? "Terms violation" : undefined }),
      });
      const json = await res.json();
      if (!res.ok) return message.error(json.error || "Failed");
      message.success(
        action === "BAN" ? "User banned and email sent (logged)" : "User reinstated and email sent (logged)"
      );
      mutateUsers();
      mutateStats();
    } catch {
      message.error("Network error");
    }
  };

  const userColumns = [
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role", render: (v: string) => <Tag>{v}</Tag> },
    { title: "Status", dataIndex: "status", key: "status", render: (v: string) =>
        v === "ACTIVE" ? <Tag color="green">ACTIVE</Tag> : <Tag color="red">BANNED</Tag> },
    { title: "Joined", dataIndex: "createdAt", key: "createdAt",
      render: (v: string) => new Date(v).toLocaleString() },
    {
      title: "Action",
      key: "action",
      render: (_: any, r: UserRow) => (
        <Space>
          {r.status === "ACTIVE" ? (
            <Popconfirm
              title="Ban this user?"
              description="They will receive a suspension email."
              okText="Ban"
              okButtonProps={{ danger: true }}
              onConfirm={() => onBanToggle(r._id, "BAN")}
            >
              <Button danger>Ban</Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Reinstate this user?"
              description="They will receive a reinstatement email."
              okText="Unban"
              onConfirm={() => onBanToggle(r._id, "UNBAN")}
            >
              <Button type="primary">Unban</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <Title level={2}>Admin Dashboard</Title>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card loading={statsLoading}><Statistic title="Users" value={stats?.users.total || 0} /></Card>
        </Col>
        <Col xs={24} md={6}>
          <Card loading={statsLoading}><Statistic title="Projects Total" value={stats?.projects.total || 0} /></Card>
        </Col>
        <Col xs={24} md={6}>
          <Card loading={statsLoading}><Statistic title="Open Projects" value={stats?.projects.open || 0} /></Card>
        </Col>
        <Col xs={24} md={6}>
          <Card loading={statsLoading}><Statistic title="Closed Projects" value={stats?.projects.closed || 0} /></Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} md={8}>
          <Card title="Users by Role" loading={statsLoading} style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rolePie} dataKey="value" nameKey="name" outerRadius={110}>
                  {rolePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Users by Status" loading={statsLoading} style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" outerRadius={110}>
                  {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Projects by Category" loading={statsLoading} style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBar}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3366CC" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Users table */}
      <Card className="mt-4" title="Users">
        <Space style={{ marginBottom: 12 }}>
          <Input.Search
            placeholder="Search email / role / status"
            allowClear
            onSearch={(val) => { setQ(val); setPage(1); }}
            style={{ width: 320 }}
          />
        </Space>
        <Table<UserRow>
          rowKey="_id"
          loading={usersLoading}
          dataSource={usersRes?.items || []}
          columns={userColumns as any}
          pagination={{
            current: page,
            pageSize: ps,
            total: usersRes?.total || 0,
            showSizeChanger: true,
            onChange: (p, size) => { setPage(p); setPs(size || 10); },
          }}
        />
      </Card>
    </div>
  );
}
