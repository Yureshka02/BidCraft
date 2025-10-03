// src/app/AntdProvider.tsx
"use client";

import { ConfigProvider, theme } from "antd";

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#14b8a6",   // Tailwind teal-500
          colorBgContainer: "#1f2937", // Tailwind gray-800
          colorBorder: "#334155",     // slate-600
          colorText: "#e5e7eb",       // gray-200
          borderRadius: 8,
        },
        components: {
          Button: {
            colorPrimary: "#14b8a6",
            colorPrimaryHover: "#0d9488",
            colorPrimaryActive: "#0f766e",
            borderRadius: 8,
            controlHeight: 48,
          },
          Input: {
            activeBorderColor: "#14b8a6",
            hoverBorderColor: "#14b8a6",
            colorTextPlaceholder: "#9ca3af",
            borderRadius: 8,
            controlHeight: 48,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
