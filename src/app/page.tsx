"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button, Card } from "antd";
import { 
  ArrowRightOutlined,
  PlayCircleOutlined,
  CheckOutlined,
  RocketOutlined,
  TeamOutlined,
  TrophyOutlined,
  DollarOutlined
} from "@ant-design/icons";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const sphereRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Create rotating sphere effect
  useEffect(() => {
    const sphere = sphereRef.current;
    if (!sphere) return;

    let animationFrame: number;
    let rotation = 0;

    const animate = () => {
      rotation += 0.2;
      if (sphere) {
        (sphere as HTMLElement).style.transform = `rotateY(${rotation}deg) rotateX(${rotation * 0.5}deg)`;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const features = [
    {
      title: "Smart Matching",
      description: "AI-powered project matching with the most relevant skilled professionals",
      icon: "🎯"
    },
    {
      title: "Live Bidding",
      description: "Real-time bidding system with instant notifications and updates",
      icon: "⚡"
    },
    {
      title: "Secure Platform",
      description: "Enterprise-grade security with escrow protection for all transactions",
      icon: "🔒"
    }
  ];

  const stats = [
    { value: "50,000+", label: "Skilled Professionals" },
    { value: "$15M+", label: "Total Project Value" },
    { value: "98%", label: "Client Satisfaction" },
    { value: "24/7", label: "Support Available" }
  ];

  // Generate sphere dots
  const generateSphereDots = () => {
    const dots = [];
    const numDots = 150;
    const radius = 200;

    for (let i = 0; i < numDots; i++) {
      const phi = Math.acos(-1 + (2 * i) / numDots);
      const theta = Math.sqrt(numDots * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      dots.push({ x, y, z });
    }

    return dots;
  };

  const sphereDots = generateSphereDots();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg"></div>
              <span className="text-xl font-semibold text-white">BidCraft</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Platform</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Enterprise</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Support</a>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                type="text" 
                className="text-gray-300 hover:text-teal-500 border-gray-600 hover:border-teal-500"
              >
                Sign In
              </Button>
              <Button 
                type="primary" 
                className="bg-teal-500 border-teal-500 hover:bg-teal-600 hover:border-teal-600 text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Black Background */}
      <section className="pt-32 pb-20 px-6 text-center bg-black relative overflow-hidden">
        {/* Rotating Sphere */}
        <div 
          ref={sphereRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none"
          style={{ perspective: '1000px' }}
        >
          {sphereDots.map((dot, index) => (
            <div
              key={index}
              className="absolute w-1 h-1 bg-teal-400/30 rounded-full"
              style={{
                left: `calc(50% + ${dot.x}px)`,
                top: `calc(50% + ${dot.y}px)`,
                transform: `translateZ(${dot.z}px)`,
                opacity: 0.3 + (dot.z + 500) / 900 * 0.9,
              }}
            />
          ))}
        </div>

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center space-x-2 bg-gray-900 rounded-full px-4 py-2 mb-8 border border-gray-800">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-400">Now available to all users</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-white">Craft Your</span>
            <br />
            <span className="text-teal-500 bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
              Success Story
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            The most elegant platform for connecting skilled professionals with meaningful projects. 
            Simple, secure, and sophisticated.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              type="primary" 
              size="large" 
              className="h-14 px-8 text-lg bg-teal-500 border-teal-500 hover:bg-teal-600 hover:border-teal-600 text-white rounded-lg transform hover:scale-105 transition-all duration-300"
              icon={<RocketOutlined />}
            >
              Start Bidding
            </Button>
           
          </div>

          
       
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center transform hover:scale-105 transition-transform duration-300"
              >
                <div className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={sectionRef} className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white">
              Designed for Excellence
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every detail crafted to provide the most seamless bidding experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`text-center transition-all duration-500 transform hover:scale-105 ${
                  isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl shadow-lg shadow-teal-500/25">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-black dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-black dark:bg-white text-white dark:text-black relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Begin?
          </h2>
          <p className="text-xl mb-8 text-gray-400 dark:text-gray-600 max-w-2xl mx-auto">
            Join the platform redefining how skilled professionals connect with opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="large" 
              className="h-14 px-8 text-lg bg-teal-500 border-teal-500 hover:bg-teal-600 hover:border-teal-600 text-white rounded-lg transform hover:scale-105 transition-all duration-300"
            >
              Create Account
            </Button>
            <Button 
              size="large" 
              className="h-14 px-8 text-lg bg-transparent border-2 border-white dark:border-black text-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white rounded-lg transform hover:scale-105 transition-all duration-300"
            >
              Contact Sales →
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-teal-500 rounded-lg"></div>
                <span className="text-lg font-semibold text-black dark:text-white">BidCraft</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                The most elegant skill bidding platform, designed for professionals who demand excellence.
              </p>
            </div>
            
            {['Platform', 'Solutions', 'Support', 'Company'].map((category) => (
              <div key={category}>
                <h4 className="font-semibold text-black dark:text-white mb-4">{category}</h4>
                <div className="space-y-2 text-sm">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <a 
                      key={i} 
                      href="#" 
                      className="block text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors transform hover:translate-x-1 duration-200"
                    >
                      Link {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              © 2024 BidCraft Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #1f2937;
        }

        ::-webkit-scrollbar-thumb {
          background: #0d9488;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #0f766e;
        }
      `}</style>
    </div>
  );
}