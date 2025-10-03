"use client";

import { useState } from "react";
import { Form, Input, Button, Select, Typography, message, Card } from "antd";
import { useRouter } from "next/navigation";
import { RocketOutlined, MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";

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
    } catch (err) {
      messageApi.error("Something went wrong, please try again.");
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
            Join BidCraft
          </Typography.Title>
          <p className="text-gray-400 text-lg">
            Create your account and start your journey
          </p>
        </div>

        <Card 
          className="bg-gray-900/80 backdrop-blur-md border-gray-800 rounded-2xl shadow-2xl"
          bodyStyle={{ padding: '40px' }}
        >
          <Form<RegisterFormValues> layout="vertical" onFinish={onFinish}>
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
              rules={[{ required: true, min: 6, message: "Password must be at least 6 characters" }]}
            >
              <Input.Password 
                size="large"
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Create a password"
                autoComplete="new-password"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-lg hover:border-teal-500 focus:border-teal-500"
              />
            </Form.Item>

            <Form.Item
              name="role"
              label={<span className="text-gray-300 font-medium">I am a</span>}
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <Select
                size="large"
                placeholder="Select your role"
                className="bg-gray-800 border-gray-700 text-white rounded-lg hover:border-teal-500"
                dropdownClassName="bg-gray-800 border-gray-700"
                options={[
                  { value: "BUYER", label: "👤 Buyer" },
                  { value: "PROVIDER", label: "💼 Service Provider" },
                ]}
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
                Create Account
              </Button>
            </Form.Item>
          </Form>

          {/* Additional info */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors">
                Terms of Service
              </a>
            </p>
          </div>
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
        
        :global(.ant-select-focused .ant-select-selector) {
          box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.2) !important;
          border-color: #14b8a6 !important;
        }
        
        :global(.ant-select:not(.ant-select-disabled):hover .ant-select-selector) {
          border-color: #14b8a6 !important;
        }
        
        :global(.ant-select-item-option-selected:not(.ant-select-item-option-disabled)) {
          background-color: rgba(45, 212, 191, 0.1) !important;
        }
        
        :global(.ant-select-item-option-active:not(.ant-select-item-option-disabled)) {
          background-color: rgba(45, 212, 191, 0.05) !important;
        }
      `}</style>
    </div>
  );
}