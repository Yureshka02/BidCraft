"use client";

import { useState } from "react";
import { Form, Input, Button, Select, Typography, message } from "antd";
import { useRouter } from "next/navigation";

type RegisterFormValues = {
  email: string;
  password: string;
  role: "BUYER" | "PROVIDER";
};

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegisterFormValues) => {
    try {
      setLoading(true);

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
    } catch (err) {
      message.error("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <Typography.Title level={3}>Create Account</Typography.Title>
      <Form<RegisterFormValues> layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input autoComplete="email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, min: 6 }]}
        >
          <Input.Password autoComplete="new-password" />
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

        <Button type="primary" htmlType="submit" block loading={loading}>
          Register
        </Button>
      </Form>
    </div>
  );
}
