"use client";
import { ConfigProvider, theme } from "antd";
import LoginForm from "./LoginForm"; // your component

export default function LoginPage() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#14b8a6",
          colorBgBase: "#0b1220",
          colorBgContainer: "#111827",
          colorText: "#e5e7eb",
          colorTextPlaceholder: "#9ca3af",
          colorBorder: "#334155",
          borderRadius: 10,
        },
        components: {
          Button: { controlHeight: 48, borderRadius: 10, colorPrimaryHover: "#0d9488", colorPrimaryActive: "#0f766e" },
          Input:  { controlHeight: 48, borderRadius: 10, activeBorderColor: "#14b8a6", hoverBorderColor: "#14b8a6" },
          Card:   { colorBgContainer: "#111827", borderRadiusLG: 16 },
        },
      }}
    >
      {/* Your existing background + form */}
      <LoginForm />
    </ConfigProvider>
  );
}
