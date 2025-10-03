"use client";

import useSWR from "swr";
import {
  Card,
  Col,
  Row,
  Statistic,
  Typography,
  message,
  Table,
  Tag,
  Input,
  Button,
  Space,
  Popconfirm,
  Empty,
} from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useMemo, useState } from "react";

const { Title } = Typography;
const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json());

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

// ----- Teal Theme Colors -----
const TEAL_THEME = {
  primary: "#008080",
  primaryLight: "#4FB9B9",
  primaryDark: "#006666",
  secondary: "#20B2AA",
  accent: "#48D1CC",
  light: "#E0F2F1",
  chart: [
    "#008080", // Teal
    "#20B2AA", // Light Sea Green
    "#48D1CC", // Medium Turquoise
    "#5F9EA0", // Cadet Blue
    "#4682B4", // Steel Blue
    "#2E8B57", // Sea Green
  ],
  gradient: {
    start: "#008080",
    end: "#20B2AA",
  }
};

// ----- Helpers for chart data with defaults -----
function makeRolePie(byRole?: Record<string, number>) {
  const r = byRole ?? {};
  const rows = [
    { name: "ADMIN", value: r.ADMIN ?? 0 },
    { name: "BUYER", value: r.BUYER ?? 0 },
    { name: "PROVIDER", value: r.PROVIDER ?? 0 },
  ];
  const total = rows.reduce((s, x) => s + x.value, 0);
  return { rows, total };
}
function makeStatusPie(byStatus?: Record<string, number>) {
  const s = byStatus ?? {};
  const rows = [
    { name: "ACTIVE", value: s.ACTIVE ?? 0 },
    { name: "BANNED", value: s.BANNED ?? 0 },
  ];
  const total = rows.reduce((s, x) => s + x.value, 0);
  return { rows, total };
}
function makeCategoryBar(byCategory?: Record<string, number>) {
  const c = byCategory ?? {};
  const known = ["design", "writing", "coding"];
  const keys = Object.keys(c).length ? Object.keys(c) : known;
  const rows = keys.map((k) => ({ category: k, count: c[k] ?? 0 }));
  const total = rows.reduce((s, x) => s + x.count, 0);
  return { rows, total };
}

// Custom Teal Tooltip for Role Pie Chart
const RoleTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: 'white',
        padding: '12px',
        border: `2px solid ${TEAL_THEME.primary}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 128, 128, 0.2)',
      }}>
        <p style={{ color: TEAL_THEME.primaryDark, fontWeight: 'bold', margin: 0 }}>
          Role: {data.payload.name}
        </p>
        <p style={{ color: TEAL_THEME.primary, margin: '4px 0 0 0' }}>
          Users: <span style={{ fontWeight: 'bold' }}>{data.value}</span>
        </p>
        <p style={{ color: TEAL_THEME.secondary, margin: '2px 0 0 0', fontSize: '12px' }}>
          {((data.value / data.payload.total) * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

// Custom Teal Tooltip for Status Pie Chart
const StatusTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: 'white',
        padding: '12px',
        border: `2px solid ${TEAL_THEME.primary}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 128, 128, 0.2)',
      }}>
        <p style={{ color: TEAL_THEME.primaryDark, fontWeight: 'bold', margin: 0 }}>
          Status: {data.payload.name}
        </p>
        <p style={{ color: TEAL_THEME.primary, margin: '4px 0 0 0' }}>
          Users: <span style={{ fontWeight: 'bold' }}>{data.value}</span>
        </p>
        <p style={{ color: TEAL_THEME.secondary, margin: '2px 0 0 0', fontSize: '12px' }}>
          {((data.value / data.payload.total) * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

// Custom Teal Tooltip for Category Bar Chart
const CategoryTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: 'white',
        padding: '12px',
        border: `2px solid ${TEAL_THEME.primary}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 128, 128, 0.2)',
      }}>
        <p style={{ color: TEAL_THEME.primaryDark, fontWeight: 'bold', margin: 0 }}>
          Category: {label}
        </p>
        <p style={{ color: TEAL_THEME.primary, margin: '4px 0 0 0' }}>
          Projects: <span style={{ fontWeight: 'bold' }}>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminClient() {
  // --- Stats ---
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    mutate: mutateStats,
  } = useSWR<StatsRes>("/api/admin/stats", fetcher, {
    onError: (err) => message.error(err?.message || "Failed to load stats"),
  });

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

  const {
    data: usersRes,
    isLoading: usersLoading,
    mutate: mutateUsers,
  } = useSWR<{ items: UserRow[]; total: number; page: number; pageSize: number }>(
    usersURL,
    fetcher,
    { onError: (err) => message.error(err?.message || "Failed to load users") }
  );

  // Chart datasets with total included for percentage calculation
  const rolePie = useMemo(() => {
    const data = makeRolePie(stats?.users.byRole);
    return {
      ...data,
      rows: data.rows.map(row => ({ ...row, total: data.total }))
    };
  }, [stats]);

  const statusPie = useMemo(() => {
    const data = makeStatusPie(stats?.users.byStatus);
    return {
      ...data,
      rows: data.rows.map(row => ({ ...row, total: data.total }))
    };
  }, [stats]);

  const categoryBar = useMemo(() => makeCategoryBar(stats?.projects.byCategory), [stats]);

  const onBanToggle = async (id: string, action: "BAN" | "UNBAN") => {
    try {
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: action === "BAN" ? "Terms violation" : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) return message.error(json.error || "Failed");
      message.success(
        action === "BAN"
          ? "User banned and email sent (logged)"
          : "User reinstated and email sent (logged)"
      );
      mutateUsers();
      mutateStats();
    } catch {
      message.error("Network error");
    }
  };

  const userColumns = [
    { 
      title: "Email", 
      dataIndex: "email", 
      key: "email",
      render: (email: string) => (
        <span style={{ color: TEAL_THEME.primaryDark, fontWeight: 500 }}>{email}</span>
      )
    },
    { 
      title: "Role", 
      dataIndex: "role", 
      key: "role", 
      render: (v: string) => (
        <Tag 
          style={{ 
            border: `1px solid ${TEAL_THEME.primaryLight}`,
            background: `${TEAL_THEME.light}80`,
            color: TEAL_THEME.primaryDark,
            fontWeight: 500,
          }}
        >
          {v}
        </Tag>
      ) 
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v: string) =>
        v === "ACTIVE" ? (
          <Tag 
            color="green"
            style={{ 
              background: '#f6ffed',
              borderColor: '#b7eb8f',
              color: '#389e0d',
              fontWeight: 500,
            }}
          >
            ACTIVE
          </Tag>
        ) : (
          <Tag 
            color="red"
            style={{ 
              background: '#fff2f0',
              borderColor: '#ffccc7',
              color: '#cf1322',
              fontWeight: 500,
            }}
          >
            BANNED
          </Tag>
        ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => (
        <span style={{ color: '#666' }}>
          {new Date(v).toLocaleString()}
        </span>
      ),
    },
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
              okButtonProps={{ 
                danger: true,
                style: { background: TEAL_THEME.primary, borderColor: TEAL_THEME.primary }
              }}
              onConfirm={() => onBanToggle(r._id, "BAN")}
            >
              <Button 
                danger 
                size="small"
                style={{
                  borderColor: '#ff4d4f',
                  fontWeight: 500,
                }}
              >
                Ban
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Reinstate this user?"
              description="They will receive a reinstatement email."
              okText="Unban"
              okButtonProps={{ 
                style: { background: TEAL_THEME.primary, borderColor: TEAL_THEME.primary }
              }}
              onConfirm={() => onBanToggle(r._id, "UNBAN")}
            >
              <Button 
                type="primary" 
                size="small"
                style={{
                  background: TEAL_THEME.primary,
                  borderColor: TEAL_THEME.primary,
                  fontWeight: 500,
                }}
              >
                Unban
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-15" style={{ background: 'linear-gradient(135deg, #f8ffff 0%, #f0f9f9 100%)', minHeight: '100vh' }}>
      <Title 
        level={2} 
        style={{ 
          color: TEAL_THEME.primaryDark,
          marginBottom: 32,
          textAlign: 'center',
          fontWeight: 700,
          background: `linear-gradient(135deg, ${TEAL_THEME.primary} 0%, ${TEAL_THEME.secondary} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Admin Dashboard
      </Title>

      {/* KPI Cards */}
      <Row gutter={[20, 20]}>
        {[
          { title: "Total Users", value: stats?.users.total ?? 0, color: TEAL_THEME.primary },
          { title: "Projects Total", value: stats?.projects.total ?? 0, color: TEAL_THEME.secondary },
          { title: "Open Projects", value: stats?.projects.open ?? 0, color: TEAL_THEME.accent },
          { title: "Closed Projects", value: stats?.projects.closed ?? 0, color: "#5F9EA0" },
        ].map((stat, index) => (
          <Col xs={24} md={6} key={stat.title}>
            <Card 
              loading={statsLoading}
              style={{
                border: `1px solid ${TEAL_THEME.light}`,
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0, 128, 128, 0.1)',
                transition: 'all 0.3s ease',
                background: 'white',
              }}
              bodyStyle={{ padding: '20px' }}
              hoverable
              className="stat-card"
            >
              <Statistic 
                title={
                  <span style={{ color: '#666', fontSize: '14px', fontWeight: 600 }}>
                    {stat.title}
                  </span>
                } 
                value={stat.value}
                valueStyle={{ 
                  color: stat.color,
                  fontSize: '32px',
                  fontWeight: 700,
                }}
                prefix={
                  <div 
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${stat.color} 0%, ${TEAL_THEME.accent} 100%)`,
                      display: 'inline-block',
                      marginRight: 8,
                    }}
                  />
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row gutter={[20, 20]} className="mt-6">
        <Col xs={24} md={8}>
          <Card 
            title={
              <span style={{ color: TEAL_THEME.primaryDark, fontWeight: 600 }}>
                Users by Role
              </span>
            } 
            loading={statsLoading} 
            style={{ 
              height: 400, 
              border: `1px solid ${TEAL_THEME.light}`,
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0, 128, 128, 0.1)',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            {rolePie.total === 0 ? (
              <Empty
                description="No data yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ marginTop: 48 }}
              />
            ) : (
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <defs>
                      {rolePie.rows.map((_, index) => (
                        <linearGradient key={index} id={`roleColor${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={TEAL_THEME.chart[index]} stopOpacity={0.8}/>
                          <stop offset="100%" stopColor={TEAL_THEME.chart[index]} stopOpacity={0.4}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={rolePie.rows}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      innerRadius={40}
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {rolePie.rows.map((_, index) => (
                        <Cell key={index} fill={`url(#roleColor${index})`} stroke={TEAL_THEME.chart[index]} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<RoleTooltip />} />
                    <Legend 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', color: TEAL_THEME.primaryDark }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card 
            title={
              <span style={{ color: TEAL_THEME.primaryDark, fontWeight: 600 }}>
                Users by Status
              </span>
            } 
            loading={statsLoading} 
            style={{ 
              height: 400, 
              border: `1px solid ${TEAL_THEME.light}`,
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0, 128, 128, 0.1)',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            {statusPie.total === 0 ? (
              <Empty
                description="No data yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ marginTop: 48 }}
              />
            ) : (
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <defs>
                      {statusPie.rows.map((_, index) => (
                        <linearGradient key={index} id={`statusColor${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={TEAL_THEME.chart[index + 2]} stopOpacity={0.8}/>
                          <stop offset="100%" stopColor={TEAL_THEME.chart[index + 2]} stopOpacity={0.4}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={statusPie.rows}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      innerRadius={40}
                      animationBegin={200}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {statusPie.rows.map((_, index) => (
                        <Cell key={index} fill={`url(#statusColor${index})`} stroke={TEAL_THEME.chart[index + 2]} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<StatusTooltip />} />
                    <Legend 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', color: TEAL_THEME.primaryDark }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card 
            title={
              <span style={{ color: TEAL_THEME.primaryDark, fontWeight: 600 }}>
                Projects by Category
              </span>
            } 
            loading={statsLoading} 
            style={{ 
              height: 400, 
              border: `1px solid ${TEAL_THEME.light}`,
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0, 128, 128, 0.1)',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            {categoryBar.total === 0 ? (
              <Empty
                description="No projects yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ marginTop: 48 }}
              />
            ) : (
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={categoryBar.rows}>
                    <defs>
                      <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={TEAL_THEME.primary} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={TEAL_THEME.secondary} stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={TEAL_THEME.light} />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fill: TEAL_THEME.primaryDark, fontSize: 12 }}
                      axisLine={{ stroke: TEAL_THEME.light }}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      tick={{ fill: TEAL_THEME.primaryDark, fontSize: 12 }}
                      axisLine={{ stroke: TEAL_THEME.light }}
                    />
                    <Tooltip content={<CategoryTooltip />} />
                    <Bar 
                      dataKey="count" 
                      fill="url(#barColor)"
                      radius={[4, 4, 0, 0]}
                      animationBegin={400}
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Users table */}
      <Card 
        className="mt-6" 
        title={
          <span style={{ color: TEAL_THEME.primaryDark, fontWeight: 600, fontSize: '18px' }}>
            User Management
          </span>
        }
        style={{
          border: `1px solid ${TEAL_THEME.light}`,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 128, 128, 0.1)',
        }}
      >
        <Space style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Search email / role / status..."
            allowClear
            onSearch={(val) => {
              setQ(val);
              setPage(1);
            }}
            style={{ width: 320 }}
            enterButton={
              <Button 
                type="primary" 
                style={{ 
                  background: TEAL_THEME.primary, 
                  borderColor: TEAL_THEME.primary,
                }}
              >
                Search
              </Button>
            }
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
            pageSizeOptions: ['10', '20', '50'],
            style: {
              marginTop: 16,
              textAlign: 'center',
            },
            onChange: (p, size) => {
              setPage(p);
              setPs(size || 10);
            },
          }}
          style={{
            borderRadius: 8,
            overflow: 'hidden',
          }}
        />
      </Card>

      {statsError ? (
        <div style={{ 
          marginTop: 16, 
          color: 'crimson',
          padding: 12,
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: 8,
          textAlign: 'center',
        }}>
          Error loading stats: {String((statsError as any)?.message || statsError)}
        </div>
      ) : null}

      <style jsx>{`
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 128, 128, 0.15) !important;
        }
      `}</style>
    </div>
  );
}