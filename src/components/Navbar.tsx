"use client";

import { Button } from "antd";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { RocketOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role; // "ADMIN" | "BUYER" | "PROVIDER"

  return (
    <nav className="fixed top-0 w-full z-50 bg-black backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25">
              <RocketOutlined className="text-white text-sm" />
            </div>
            <a
              className="text-xl font-bold text-white hover:text-teal-400 transition-colors duration-300"
              onClick={() => router.push("/")}
            >
              BidCraft
            </a>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Always */}
            <a 
              href="/projects" 
              className="text-gray-300 hover:text-teal-400 transition-colors duration-300 font-medium"
            >
              Projects
            </a>
             <a 
              href="/projects" 
              className="text-gray-300 hover:text-teal-400 transition-colors duration-300 font-medium"
            >
              About
            </a>
              <a 
              href="/projects" 
              className="text-gray-300 hover:text-teal-400 transition-colors duration-300 font-medium"
            >
              What's New
            </a>

            {/* Only when logged in (role-specific) */}
            {role === "ADMIN" && (
              <a 
                href="/admin" 
                className="text-gray-300 hover:text-teal-400 transition-colors duration-300 font-medium"
              >
                Admin Dashboard
              </a>
            )}
            {role === "BUYER" && (
              <a 
                href="/buyer" 
                className="text-gray-300 hover:text-teal-400 transition-colors duration-300 font-medium"
              >
                My Projects
              </a>
            )}
            {role === "PROVIDER" && (
              <a 
                href="/provider" 
                className="text-gray-300 hover:text-teal-400 transition-colors duration-300 font-medium"
              >
                My Bids
              </a>
            )}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
            {!session ? (
              <>
                <Button
                  size="small"
                  type="primary"
                  className="bg-transparent border-teal-500 text-teal-500 hover:bg-teal-500/10 hover:border-teal-400 hover:text-teal-400 transition-all duration-300"
                  onClick={() => router.push("/login")}
                  icon={<UserOutlined />}
                >
                  Log In
                </Button>
              
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* User info */}
                <div className="hidden sm:flex items-center space-x-2">
                  
                    
                  
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">
                      {session.user?.email}
                    </p>
                    <p className="text-teal-400 text-xs capitalize">
                      {role?.toLowerCase()}
                    </p>
                  </div>
                </div>
                
                <Button 
                  size="middle" 
                  danger 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-transparent border-red-500 text-red-500 hover:bg-red-500/10 hover:border-red-400 hover:text-red-400 transition-all duration-300"
                  icon={<LogoutOutlined />}
                >
                  
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}