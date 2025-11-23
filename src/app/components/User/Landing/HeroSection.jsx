"use client"
import { useState, useEffect } from 'react';
import { ArrowRight, Play, CheckCircle, Target, Rocket, BarChart3, Clock } from 'lucide-react';

export default function HeroSection() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const features = [
    { icon: Target, text: "AI-Powered Learning Paths" },
    { icon: Rocket, text: "Launch Ready Platform" },
    { icon: BarChart3, text: "Real-Time Analytics" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dot pattern background */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #155d59 1px, transparent 0)`,
            backgroundSize: '40px 40px',
            opacity: 0.08
          }}
        ></div>

        {/* Static gradient areas */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full blur-3xl"></div>

        {/* Decorative circles */}
        <div className="absolute top-32 right-32 w-32 h-32 border-2 border-purple-300 rounded-full" style={{ opacity: 0.1 }}></div>
        <div className="absolute bottom-40 right-40 w-24 h-24 border-2 border-blue-300 rounded-full" style={{ opacity: 0.1 }}></div>
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.05,
          backgroundImage: `
            linear-gradient(#155d59 1px, transparent 1px),
            linear-gradient(90deg, #155d59 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 sm:space-y-8 animate-fade-in-up order-2 lg:order-1">
            {/* Trust Badge with Urgency */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full backdrop-blur-sm">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-900 font-medium">Limited spots - Join 1.2K+ on waitlist</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  People
                </span>
                {' '}+ A.I.
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
                Elevate your workforce with adaptive learning experiences that drive measurable results. Boost engagement, accelerate growth, and achieve business goals faster.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105">
                Join Waitlist
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="group px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Rotating Features */}
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 transition-all duration-500 ${activeFeature === index ? 'scale-110 opacity-100' : 'opacity-60'
                    }`}
                >
                  <feature.icon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Interactive Visual */}
          <div className="relative h-auto lg:h-[650px] animate-slide-in-right order-1 lg:order-2">
            {/* Tasks Card (Behind) */}
            <div className="hidden lg:block absolute top-52 right-20 w-full max-w-md bg-white rounded-2xl shadow-xl hover:shadow-[0_25px_60px_rgba(147,51,234,0.2)] transition-all duration-300 z-10 overflow-hidden">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Tasks Overview</h3>

                {/* To Do */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">To Do:</h4>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                    <span className="text-sm text-gray-700">Complete first course</span>
                  </div>
                </div>

                {/* Started */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">Started:</h4>
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                    <div className="w-4 h-4 border-2 border-yellow-400 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-sm"></div>
                    </div>
                    <span className="text-sm text-gray-700">Exploring platform features</span>
                  </div>
                </div>

                {/* Completed */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">Completed:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 line-through">Complete onboarding</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 line-through">Review company policies</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Card (Front) */}
            <div className="hidden lg:block absolute top-0 right-0 w-full max-w-md bg-white rounded-2xl shadow-2xl hover:shadow-[0_25px_60px_rgba(147,51,234,0.2)] transition-all duration-300 z-20 overflow-hidden">
              {/* Gradient Header */}
              <div className="h-24 bg-gradient-to-r from-purple-400 via-pink-300 to-purple-300 relative">
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    SJ
                  </div>
                </div>
              </div>

              <div className="pt-14 px-6 pb-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Sarah Johnson</h3>
                  <p className="text-sm text-gray-500">Contingency Agent</p>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  {['Leadership Skills', 'Technical Training', 'Soft Skills'].map((skill, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{skill}</span>
                        <span className="text-[#155d59] font-semibold">{85 - index * 10}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#155d59] to-[#4a9b94] rounded-full animate-progress"
                          style={{ width: `${85 - index * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar at Bottom */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { value: "1.2K+", label: "Waitlist Members" },
              { value: "250+", label: "Beta Testers" },
              { value: "96%", label: "Interest Score" },
              { value: "Q2 2026", label: "Launch Date" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsVideoPlaying(false)}
        >
          <div className="relative w-full max-w-4xl aspect-video bg-white rounded-2xl overflow-hidden border-2 border-gray-200 animate-scale-in">
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-900 z-10 transition-colors"
            >
              ✕
            </button>
            <div className="absolute inset-0 flex items-center justify-center text-gray-900 text-xl">
              <div className="text-center space-y-4">
                <Play className="w-20 h-20 text-purple-600 mx-auto" />
                <p>Demo Video Placeholder</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}