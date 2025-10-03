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

// Move stats array to the top, before any hooks that use it
const stats = [
  { value: "50,000+", label: "Skilled Professionals", suffix: "+" },
  { value: "$15M+", label: "Total Project Value", suffix: "M+" },
  { value: "98%", label: "Client Satisfaction", suffix: "%" },
  { value: "24/7", label: "Support Available", suffix: "%" }
];

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(stats.map(() => 0));
  const sectionRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Intersection Observer for features section
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

  // Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start counting animation when stats section is visible
          stats.forEach((stat, index) => {
            const target = getNumericValue(stat.value);
            animateNumber(index, 0, target, 2000);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Intersection Observer for features animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const featureCards = entry.target.querySelectorAll('.feature-card');
            featureCards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('animate-feature-card');
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Optimized rotating sphere effect
  useEffect(() => {
    const sphere = sphereRef.current;
    if (!sphere) return;

    let rotation = 0;
    const rotationSpeed = 0.1; // Even slower for better performance

    const animate = (timestamp: number) => {
      rotation += rotationSpeed;
      
      // Use transform3d for hardware acceleration
      sphere.style.transform = `rotate3d(0.3, 0.7, 0, ${rotation}deg)`;
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Helper function to extract numeric value from stat string
  const getNumericValue = (value: string) => {
    if (value.includes('+')) return parseInt(value.replace(/[^0-9]/g, ''));
    if (value.includes('%')) return parseInt(value.replace('%', ''));
    if (value === '24/7') return 100; // Special case for 24/7, return as number
    return parseInt(value.replace(/[^0-9]/g, ''));
  };

  // Number animation function
  const animateNumber = (index: number, start: number, end: number, duration: number) => {
    const startTime = performance.now();
    
    const updateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(start + (end - start) * easeOutQuart);
      
      setAnimatedStats(prev => {
        const newStats = [...prev];
        newStats[index] = currentValue;
        return newStats;
      });

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };

    requestAnimationFrame(updateNumber);
  };

  const features = [
    {
      title: "Smart Matching",
      description: "Project matching with the most relevant skilled professionals",
      icon: "🎯",
      color: "from-teal-300 to-teal-600",
      shadow: "shadow-teal-500/25"
    },
    {
      title: "Live Bidding",
      description: "Real-time bidding system with instant notifications and updates",
      icon: "⚡",
      color: "from-blue-300 to-blue-600",
      shadow: "shadow-blue-500/50"
    },
    {
      title: "Secure Platform",
      description: "Enterprise-grade security with escrow protection for all transactions",
      icon: "🔒",
      color: "from-yellow-300 to-yellow-600",
      shadow: "shadow-purple-500/25"
    }
  ];

  const footerLinks = {
    platform: ["Features", "Pricing", "API", "Integrations"],
    solutions: ["For Freelancers", "For Agencies", "For Enterprises", "Case Studies"],
    support: ["Help Center", "Community", "Contact Us", "Documentation"],
    company: ["About Us", "Careers", "Blog", "Press Kit"]
  };

  // Generate optimized sphere dots
  const generateSphereDots = () => {
    const dots = [];
    const numDots = 200; // Reduced for better performance
    const radius = 400;

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
              <div className="w-8 h-8 bg-teal-700 rounded-lg"></div>
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
                Log In
              </Button>
                <Button 
                type="primary" 
                className="bg-teal-500 border-teal-500 hover:bg-teal-600 hover:border-teal-600 text-white"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen */}
      <section className="min-h-screen pt-20 pb-20 px-6 text-center bg-black relative overflow-hidden flex items-center justify-center">
        {/* Optimized Rotating Sphere */}
        <div 
          ref={sphereRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none"
          style={{ 
            perspective: '1000px',
            transformStyle: 'preserve-3d',
            willChange: 'transform'
          }}
        >
          {sphereDots.map((dot, index) => (
            <div
              key={index}
              className="absolute w-1.5 h-1.5 bg-teal-400/30 rounded-full"
              style={{
                left: `calc(50% + ${dot.x}px)`,
                top: `calc(50% + ${dot.y}px)`,
                transform: `translate3d(0, 0, ${dot.z}px)`,
                opacity: 0.3 + (dot.z + 400) / 800 * 0.7,
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </div>

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center space-x-2 bg-gray-900 rounded-full px-4 py-2 mb-8 border border-gray-800">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-400">Now available to all users</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight">
            <span className="text-white">Craft Your</span>
            <br />
            <span className="text-teal-500 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 bg-clip-text text-transparent">
              Success Story
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            The most elegant platform for connecting skilled professionals with meaningful projects. 
            Simple, secure, and sophisticated.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              type="default"
              size="large" 
              className="h-16 px-10 text-xl bg-transparent border-2 border-teal-500 hover:bg-teal-500/10 text-teal-500 hover:text-teal-400 rounded-xl transform hover:scale-105 transition-all duration-300"
              icon={<RocketOutlined className="text-teal-500" />}
            >
              Get Started
            </Button>
            
          </div>
        </div>
      </section>

      {/* Stats Section with Animated Numbers */}
      <section ref={statsRef} className="py-32 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center transform hover:scale-110 transition-transform duration-500"
              >
                <div className="text-4xl md:text-4xl font-bold text-black dark:text-white mb-4">
                  {stat.value.includes('$') && '$'}
                  {animatedStats[index].toLocaleString()}
                  {stat.suffix}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-lg md:text-xl font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-32 px-6 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white">
              Designed for Excellence
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every detail crafted to provide the most seamless bidding experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="feature-card opacity-0 transform translate-y-8 transition-all duration-700 ease-out"
              >
                <div className="group relative bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 hover:border-teal-500/30 hover:-translate-y-2">
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
                  
                  {/* Floating icon container */}
                  <div className={`relative w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl ${feature.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    {feature.icon}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-semibold mb-4 text-black dark:text-white text-center group-hover:text-teal-500 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-center">
                    {feature.description}
                  </p>
                  
                  {/* Animated underline */}
                  <div className="w-0 group-hover:w-12 h-0.5 bg-gradient-to-r from-teal-500 to-blue-500 mx-auto mt-4 transition-all duration-500"></div>
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BC</span>
                </div>
                <span className="text-xl font-bold text-black dark:text-white">BidCraft</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md">
                The most elegant skill bidding platform, designed for professionals who demand excellence. 
                Connect, collaborate, and create extraordinary projects.
              </p>
              <div className="flex space-x-4 mt-6">
                {['Twitter', 'LinkedIn', 'GitHub', 'Dribbble'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-teal-500 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    {social.charAt(0)}
                  </a>
                ))}
              </div>
            </div>
            
            {/* Footer Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-semibold text-black dark:text-white mb-4 capitalize">
                  {category}
                </h4>
                <div className="space-y-3 text-sm">
                  {links.map((link, i) => (
                    <a 
                      key={i} 
                      href="#" 
                      className="block text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors duration-200 hover:translate-x-1 transform"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-4 md:mb-0">
              © 2024 BidCraft Inc. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-500 dark:text-gray-500 hover:text-teal-500 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-500 dark:text-gray-500 hover:text-teal-500 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-500 dark:text-gray-500 hover:text-teal-500 transition-colors">Cookie Policy</a>
            </div>
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
        
        @keyframes feature-card-appear {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-feature-card {
          animation: feature-card-appear 0.8s ease-out forwards;
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