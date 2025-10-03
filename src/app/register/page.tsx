"use client";

import { useState } from "react";
import { Form, Input, Button, Select, Typography, message, Card, ConfigProvider, theme } from "antd";
import { useRouter } from "next/navigation";
import { RocketOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";

type RegisterFormValues = {
  email: string;
  password: string;
  role: "BUYER" | "PROVIDER";
};

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: RegisterFormValues) => {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        messageApi.success("🎉 Registered successfully! Please log in.");
        router.push("/login");
      } else {
        const data = await res.json();
        messageApi.error(data.error || "Registration failed");
      }
    } catch {
      messageApi.error("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#14b8a6",
          colorBgBase: "#0b1220",
          colorBgContainer: "#111827",
          colorText: "#e5e7eb",
          colorBorder: "#334155",
          colorTextPlaceholder: "#9ca3af",
          borderRadius: 10,
        },
        components: {
          Button: { controlHeight: 48, borderRadius: 10 },
          Input: { controlHeight: 48, borderRadius: 10 },
          Select: { controlHeight: 48, borderRadius: 10 },
          Card: { colorBgContainer: "#111827", borderRadiusLG: 16 },
        },
      }}
    >
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-6">
        {/* Background visuals */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

        {contextHolder}

        <div className="max-w-md w-full mx-auto relative z-10">
          {/* Branding */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
                <RocketOutlined className="text-white text-lg" />
              </div>
              <span className="text-2xl font-bold text-white">BidCraft</span>
            </div>
            <Typography.Title level={2} className="!text-white !mb-2">
              Join BidCraft
            </Typography.Title>
            <p className="text-gray-400 text-lg">Create your account and start your journey</p>
          </div>

          {/* Register Card */}
          <Card className="bg-gray-900/80 backdrop-blur-md border-gray-800 rounded-2xl shadow-2xl" bodyStyle={{ padding: "40px" }}>
            <Form<RegisterFormValues> layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="email"
                label={<span className="text-gray-300 font-medium">Email</span>}
                rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
              >
                <Input size="large" prefix={<MailOutlined className="text-gray-400" />} placeholder="Enter your email" autoComplete="email" />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="text-gray-300 font-medium">Password</span>}
                rules={[{ required: true, min: 6, message: "Password must be at least 6 characters" }]}
              >
                <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} placeholder="Create a password" autoComplete="new-password" />
              </Form.Item>

              <Form.Item
                name="role"
                label={<span className="text-gray-300 font-medium">I am a</span>}
                rules={[{ required: true, message: "Please select a role" }]}
              >
                <Select
                  size="large"
                  placeholder="Select your role"
                  options={[
                    { value: "BUYER", label: "👤 Buyer" },
                    { value: "PROVIDER", label: "💼 Service Provider" },
                  ]}
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button type="primary" htmlType="submit" size="large" loading={loading} block className="h-12">
                  Create Account
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Footer note */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-teal-400 hover:text-teal-300 transition-colors font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
