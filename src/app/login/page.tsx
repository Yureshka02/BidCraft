"use client";
import { Form, Input, Button, Typography, message } from "antd";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/";

  const onFinish = async (values: any) => {
    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl
    });
    if (res?.error) message.error(res.error || "Invalid credentials");
    else router.push(callbackUrl);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Typography.Title level={3}>Login</Typography.Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>Sign In</Button>
      </Form>
    </div>
  );
}
