"use client"
import { useState, useEffect } from 'react';
import { ArrowRight, Play, CheckCircle, Users, TrendingUp, Award } from 'lucide-react';

export default function ModernHeroSection() {
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
            opacity: 0.25
          }}
        ></div>

        {/* Diagonal lines pattern */}
        {/* <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              #155d59 35px,
              #155d59 36px
            )`,
            opacity: 0.05
          }}
        ></div> */}

        {/* Static gradient areas - no animation, positioned in corners */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#155d59]/10 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#4a9b94]/8 to-transparent rounded-full blur-2xl"></div>

        {/* Decorative circles */}
        <div className="absolute top-32 right-32 w-32 h-32 border-2 border-[#155d59] rounded-full" style={{ opacity: 0.08 }}></div>
        <div className="absolute bottom-40 right-40 w-24 h-24 border-2 border-[#4a9b94] rounded-full" style={{ opacity: 0.08 }}></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-[#155d59] rounded-full" style={{ opacity: 0.06 }}></div>

        {/* Geometric pattern */}
        {/* <div
          className="absolute bottom-1/3 right-1/4 w-40 h-40"
          style={{
            opacity: 0.08,
            background: `linear-gradient(135deg, #155d59 25%, transparent 25%), 
                        linear-gradient(225deg, #155d59 25%, transparent 25%), 
                        linear-gradient(45deg, #155d59 25%, transparent 25%), 
                        linear-gradient(315deg, #155d59 25%, transparent 25%)`,
            backgroundPosition: '0 0, 20px 0, 20px -20px, 0px 20px',
            backgroundSize: '40px 40px'
          }}
        ></div> */}
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.08,
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
          <div className="space-y-8 animate-fade-in-up">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#155d59]/5 border border-[#155d59]/20 rounded-full backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 text-[#155d59]" />
              <span className="text-sm text-gray-700">Trusted by industry leaders</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                <span className="text-[#155d59]">
                  People
                </span>
                + A.I.
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Elevate your workforce with adaptive learning experiences that drive measurable results. Boost engagement, accelerate growth, and achieve business goals faster.
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