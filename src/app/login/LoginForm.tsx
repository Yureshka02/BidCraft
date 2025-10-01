"use client";

import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { signIn, type SignInResponse } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const redirectByRole = (role?: string) => {
    switch (role) {
      case "ADMIN":
        router.push("/admin");
        break;
      case "BUYER":
        router.push("/buyer");
        break;
      case "PROVIDER":
        router.push("/provider");
        break;
      default:
        router.push("/");
    }
  };

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);

      const res = (await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      })) as SignInResponse | undefined;

      if (!res) {
        messageApi.error("Unexpected error. Please try again.");
        return;
      }
      if (res.error) {
        messageApi.error(res.error || "Invalid email or password");
        return;
      }

      // fetch session to read role
      const session = await fetch("/api/auth/session", { cache: "no-store" }).then(r => r.json());
      messageApi.success("Login successful! Redirecting…");
      setTimeout(() => redirectByRole(session?.user?.role), 700);
    } catch {
      messageApi.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      {contextHolder}
      <Typography.Title level={3}>Login</Typography.Title>
      <Form<LoginFormValues> layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
        >
          <Input autoComplete="email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={loading}>
          Sign In
        </Button>
      </Form>
    </div>
  );
}
