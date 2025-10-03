"use client";

import { useState } from "react";
import { Form, Input, Button, Typography, message, Card } from "antd";
import { signIn, type SignInResponse } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { RocketOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";

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
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-6">
      {/* Background elements matching homepage */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

      {contextHolder}
      
      <div className="max-w-md w-full mx-auto relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <RocketOutlined className="text-white text-lg" />
            </div>
            <span className="text-2xl font-bold text-white">BidCraft</span>
          </div>
          <Typography.Title level={2} className="!text-white !mb-2">
            Welcome Back
          </Typography.Title>
          <p className="text-gray-400 text-lg">
            Sign in to your account
          </p>
        </div>

        <Card 
          className="bg-gray-900/80 backdrop-blur-md border-gray-800 rounded-2xl shadow-2xl"
          bodyStyle={{ padding: '40px' }}
        >
          <Form<LoginFormValues> layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="email"
              label={<span className="text-gray-300 font-medium">Email</span>}
              rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
            >
              <Input 
                size="large"
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Enter your email"
                autoComplete="email"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-lg hover:border-teal-500 focus:border-teal-500"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-gray-300 font-medium">Password</span>}
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password 
                size="large"
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-lg hover:border-teal-500 focus:border-teal-500"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                loading={loading}
                block 
                className="h-12 bg-teal-500 border-teal-500 hover:bg-teal-600 hover:border-teal-600 text-white rounded-lg transform hover:scale-105 transition-all duration-300 text-lg font-medium"
                icon={<RocketOutlined />}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          {/* Additional links */}
          <div className="mt-6 text-center">
            <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors text-sm">
              Forgot your password?
            </a>
          </div>
        </Card>

        {/* Footer note */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Don't have an account?{" "}
            <a href="/register" className="text-teal-400 hover:text-teal-300 transition-colors font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        /* Custom input focus styles */
        :global(.ant-input:focus),
        :global(.ant-input-focused) {
          box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.2) !important;
        }
        
        :global(.ant-input-password .ant-input:focus) {
          box-shadow: none !important;
        }
        
        :global(.ant-input-affix-wrapper-focused) {
          box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.2) !important;
        }
      `}</style>
    </div>
  );
}