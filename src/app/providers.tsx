"use client";

import { SessionProvider } from "next-auth/react";
import { ConfigProvider, theme } from "antd";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ConfigProvider
        theme={{
          // Use AntD's dark theme + your brand tokens
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: "#14b8a6",        // teal-500
            colorBgBase: "#0b1220",         // page background
            colorBgContainer: "#111827",    // card / inputs background
            colorBorder: "#334155",         // slate-600
            colorText: "#e5e7eb",           // gray-200
            colorTextPlaceholder: "#9ca3af",
            borderRadius: 10,
          },
          components: {
            Button: {
              colorPrimary: "#14b8a6",
              colorPrimaryHover: "#0d9488",
              colorPrimaryActive: "#0f766e",
              controlHeight: 48,
              borderRadius: 10,
            },
            Input: {
              // borders & placeholders
              activeBorderColor: "#14b8a6",
              hoverBorderColor: "#14b8a6",
              colorTextPlaceholder: "#9ca3af",
              controlHeight: 48,
              borderRadius: 10,
            },
            Card: {
              colorBgContainer: "#111827",
              borderRadiusLG: 16,
            },
          },
        }}
      >
        {/* optional global background so the dark theme shows through */}
        <div className="min-h-screen bg-black">{children}</div>
      </ConfigProvider>
    </SessionProvider>
  );
}
