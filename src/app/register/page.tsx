"use client";

import { Form, Input, Button, Select, Typography, message } from "antd";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const onFinish = async (values: any) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      message.success("🎉 Registered successfully! Please log in.");
      router.push("/login");
    } else {
      const data = await res.json();
      message.error(data.error || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <Typography.Title level={3}>Create Account</Typography.Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, min: 6 }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="role"
          label="I am a"
          rules={[{ required: true, message: "Please select a role" }]}
        >
          <Select
            options={[
              { value: "BUYER", label: "Buyer" },
              { value: "PROVIDER", label: "Service Provider" },
            ]}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          Register
        </Button>
      </Form>
    </div>
  );
}
