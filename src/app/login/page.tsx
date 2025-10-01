"use client";

import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { signIn, type SignInResponse } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams(); // okay in a client component
  // If you want to honor callbackUrl sometimes, you can read it here:
  // const callbackUrl = sp.get("callbackUrl") || "/";

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
        // callbackUrl, // intentionally ignored to always go to role landing
      })) as SignInResponse | undefined;

      if (!res) {
        messageApi.error("Unexpected error. Please try again.");
        return;
      }
      if (res.error) {
        messageApi.error(res.error || "Invalid email or password");
        return;
      }

      // Fetch the session to read the role and route accordingly
      const session = await fetch("/api/auth/session", {
        cache: "no-store",
      }).then((r) => r.json());

      const role: string | undefined = session?.user?.role;
      messageApi.success("Login successful! Redirecting…");
      setTimeout(() => redirectByRole(role), 700);
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
