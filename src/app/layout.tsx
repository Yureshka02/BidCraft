import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "antd/dist/reset.css";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

import { ConfigProvider, theme } from "antd";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BidCraft",
  description: "Reverse auction marketplace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {/* Global LIGHT theme */}
          <ConfigProvider
            theme={{
              algorithm: theme.defaultAlgorithm,
              token: {
                colorPrimary: "#14b8a6",       // teal
                colorBgBase: "#ffffff",
                colorBgContainer: "#ffffff",
                colorText: "#0f172a",
                colorBorder: "#e5e7eb",
                borderRadius: 8,
              },
              components: {
                Button: { controlHeight: 40 },
                Input:  { controlHeight: 40 },
                Card:   { borderRadiusLG: 12 },
              },
            }}
          >
            <Navbar />
            {/* offset for fixed navbar */}
            <div className="pt-15">{children}</div>
          </ConfigProvider>
        </Providers>
      </body>
    </html>
  );
}
