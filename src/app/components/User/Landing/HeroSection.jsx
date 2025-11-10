"use client"

import { useState, useEffect } from 'react';
import { ArrowRight, Play, CheckCircle, Users, TrendingUp, Award } from 'lucide-react';

export default function HeroSection() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const features = [
    { icon: Users, text: "500+ Companies Trust Us" },
    { icon: TrendingUp, text: "40% Performance Increase" },
    { icon: Award, text: "95% Completion Rate" }
  ];

  const stats = [
    { value: "10M+", label: "Training Hours Delivered" },
    { value: "50K+", label: "Active Learners" },
    { value: "98%", label: "Satisfaction Rate" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Background Pattern - Education/Learning Theme */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle geometric pattern suggesting learning paths/connections */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="network" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              {/* Network nodes representing learning connections */}
              <circle cx="20" cy="20" r="2" fill="#155d59" />
              <circle cx="100" cy="50" r="2" fill="#155d59" />
              <circle cx="180" cy="80" r="2" fill="#155d59" />
              <circle cx="50" cy="120" r="2" fill="#155d59" />
              <circle cx="150" cy="150" r="2" fill="#155d59" />

              {/* Connecting lines representing learning paths */}
              <line x1="20" y1="20" x2="100" y2="50" stroke="#155d59" strokeWidth="0.5" opacity="0.3" />
              <line x1="100" y1="50" x2="180" y2="80" stroke="#155d59" strokeWidth="0.5" opacity="0.3" />
              <line x1="100" y1="50" x2="50" y2="120" stroke="#155d59" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="120" x2="150" y2="150" stroke="#155d59" strokeWidth="0.5" opacity="0.3" />

              {/* Brain/neuron-like connections */}
              <path d="M 20 20 Q 60 35, 100 50" stroke="#4a9b94" strokeWidth="0.5" fill="none" opacity="0.2" />
              <path d="M 100 50 Q 125 100, 150 150" stroke="#4a9b94" strokeWidth="0.5" fill="none" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#network)" />
        </svg>

        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#155d59]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4a9b94]/5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

        {/* Floating abstract shapes representing knowledge/achievement */}
        <div className="absolute top-20 right-20 opacity-[0.02]">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Trophy/Achievement shape */}
            <path d="M100 20 L120 60 L160 60 L130 85 L145 120 L100 95 L55 120 L70 85 L40 60 L80 60 Z" fill="#155d59" />
            {/* Book pages */}
            <rect x="60" y="140" width="80" height="40" rx="2" fill="#4a9b94" />
            <line x1="70" y1="150" x2="130" y2="150" stroke="white" strokeWidth="2" />
            <line x1="70" y1="160" x2="130" y2="160" stroke="white" strokeWidth="2" />
            <line x1="70" y1="170" x2="110" y2="170" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        <div className="absolute bottom-20 left-20 opacity-[0.02]">
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Brain/AI representation */}
            <circle cx="90" cy="90" r="70" stroke="#155d59" strokeWidth="3" fill="none" />
            <path d="M50 90 Q70 70, 90 90 T130 90" stroke="#4a9b94" strokeWidth="2" fill="none" />
            <circle cx="60" cy="80" r="5" fill="#155d59" />
            <circle cx="90" cy="90" r="5" fill="#155d59" />
            <circle cx="120" cy="80" r="5" fill="#155d59" />
          </svg>
        </div>
      </div>

      {/* Subtle grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(21, 93, 89, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(21, 93, 89, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#155d59]/5 border border-[#155d59]/20 rounded-full backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 text-[#155d59]" />
              <span className="text-sm text-gray-700">Trusted by industry leaders</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                People+
                <span className="text-[#155d59]">
                  A.I.
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Empower your workforce with adaptive learning experiences that drive measurable results. Boost engagement, accelerate growth, and achieve business goals faster.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group px-8 py-4 bg-[#155d59] hover:bg-[#124a47] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105">
                Request a Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="group px-8 py-4 bg-white border-2 border-[#155d59] text-[#155d59] font-semibold rounded-lg hover:bg-[#155d59]/5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Rotating Features */}
            <div className="flex flex-wrap gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 transition-all duration-500 ${activeFeature === index ? 'scale-110 opacity-100' : 'opacity-60'
                    }`}
                >
                  <feature.icon className="w-5 h-5 text-[#4a9b94]" />
                  <span className="text-sm text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Interactive Visual */}
          <div className="relative lg:h-[600px] animate-slide-in-right">
            {/* Main Dashboard Card */}
            <div className="absolute top-0 right-0 w-full max-w-md bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-2xl hover:scale-105 hover:shadow-[0_20px_50px_rgba(21,93,89,0.15)] transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#155d59] to-[#4a9b94] rounded-full"></div>
                    <div>
                      <h3 className="text-gray-900 font-semibold">Sarah Johnson</h3>
                      <p className="text-gray-500 text-sm">Learning Progress</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-semibold">
                    Active
                  </div>
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

            {/* Stats Card */}
            <div className="absolute bottom-0 left-0 w-72 bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-2xl hover:scale-105 hover:shadow-[0_20px_50px_rgba(21,93,89,0.15)] transition-all duration-300">
              <h4 className="text-gray-900 font-semibold mb-4">Team Performance</h4>
              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">{stat.label}</span>
                    <span className="text-2xl font-bold text-[#155d59]">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Achievement Badges */}
            <div className="absolute top-1/4 -left-12 w-24 h-24 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4 shadow-xl animate-float">
              <Award className="w-full h-full text-yellow-600" />
            </div>

            <div className="absolute bottom-1/4 -right-12 w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-3 shadow-xl animate-float-delayed">
              <TrendingUp className="w-full h-full text-green-600" />
            </div>
          </div>
        </div>

        {/* Stats Bar at Bottom */}
        <div className="mt-20 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Enterprise Clients" },
              { value: "50K+", label: "Active Users" },
              { value: "98%", label: "Customer Satisfaction" },
              { value: "40%", label: "Performance Boost" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-[#155d59] mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
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
                <Play className="w-20 h-20 text-[#155d59] mx-auto" />
                <p>Demo Video Placeholder</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}