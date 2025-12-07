'use client'

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, GraduationCap, ArrowLeft } from 'lucide-react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Polygon vertices
    const polygons = [];
    const numPolygons = 80;

    // Initialize polygons
    for (let i = 0; i < numPolygons; i++) {
      polygons.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 100 + 50,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.001,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0d4d4d');
      gradient.addColorStop(0.5, '#1a6666');
      gradient.addColorStop(1, '#0a3d3d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw polygons
      polygons.forEach((poly) => {
        ctx.save();
        ctx.translate(poly.x, poly.y);

        // Rotate based on mouse position
        const dx = mousePos.current.x - poly.x;
        const dy = mousePos.current.y - poly.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / 300);

        ctx.rotate(poly.rotation + influence * 0.5);

        // Draw triangle
        ctx.beginPath();
        ctx.moveTo(0, -poly.size / 2);
        ctx.lineTo(-poly.size / 2, poly.size / 2);
        ctx.lineTo(poly.size / 2, poly.size / 2);
        ctx.closePath();

        const hue = 180 + influence * 20;
        ctx.fillStyle = `hsla(${hue}, 45%, 35%, ${poly.opacity + influence * 0.2})`;
        ctx.fill();

        ctx.strokeStyle = `hsla(${hue}, 55%, 45%, ${0.4 + influence * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();

        // Update rotation
        poly.rotation += poly.rotationSpeed;
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
};

const SignInPage = () => {
  const router = useRouter();
  return (
    <div className="flex h-screen max-h-screen overflow-hidden">
      {/* Left side - Animated Background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700">
        <AnimatedBackground />

        {/* Back button and Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>

          <div className="bg-white rounded-2xl px-6 py-3 shadow-xl flex items-center gap-3 ring-1 ring-white/10">
            <GraduationCap className="w-8 h-8 text-teal-600" />
            <span className="text-lg font-bold text-gray-900">Skill-Learn</span>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-[420px]">
          {/* Language selector */}
          <div className="flex justify-end mb-8">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Globe className="w-4 h-4" />
              <span className="text-sm">English</span>
            </button>
          </div>

          {/* Sign in card */}
          <div className="bg-white rounded-[28px] shadow-[0_30px_60px_rgba(6,17,29,0.18)] p-10 border border-transparent">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center shadow-inner border border-white/60">
                <GraduationCap className="w-8 h-8 text-teal-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-[30px] md:text-[34px] font-extrabold text-center text-[#0b1320] mb-2 leading-tight">
              Sign In to Skill-Learn
            </h1>
            <p className="text-center text-[#55606a] mb-6 max-w-[360px] mx-auto">
              Welcome back! Please sign in to continue.
            </p>

            {/* Form fields */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-[#e6eef6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6a4] focus:border-transparent bg-white placeholder:text-[#98a0aa] text-[#0b1320]"
                aria-label="username"
              />
            </div>

            <button
              className="w-full bg-[#07121c] text-white h-12 rounded-full text-base font-semibold hover:bg-[#071827] transition-colors flex items-center justify-center gap-3 shadow-[0_12px_30px_rgba(7,18,28,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#06b6a4]"
              aria-label="Continue"
            >
              <span>Continue</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </button>

            {/* Sign up link */}
            <p className="text-center mt-6 text-sm text-[#59626b]">
              Don&apos;t have an account?{' '}
              <a href="#" className="text-blue-600 hover:underline font-medium">
                Sign up
              </a>
            </p>

            {/* Clerk branding */}
            <p className="text-center mt-6 text-xs text-[#98a0a8]">
              Secured by <span className="font-semibold text-[#0b1320]">Clerk</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer bar at bottom matching screenshot */}
      <div className="fixed left-0 right-0 bottom-0 bg-transparent pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#94a3b8] pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#a3b0bd]">© {new Date().getFullYear()} · All rights reserved by Skill-Learn.ca</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="text-[13px] text-[#94a3b8] hover:text-[#6b7280]">Privacy Policy</a>
            <a href="#" className="text-[13px] text-[#94a3b8] hover:text-[#6b7280]">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;