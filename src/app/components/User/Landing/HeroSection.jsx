"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              People + <span className="text-[#4a9b94]">AI</span>: Succeeding Together
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Our adaptive learning platform tailors courses, feedback, and coaching to every employee helping teams perform better and feel engaged.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild
                size="lg"
                className="bg-[#155d59] hover:bg-[#124a47] text-white"
              >
                <Link href="/sign-up">Request a demo</Link>
              </Button>
              <Link 
                href="/sign-in" 
                className="flex items-center gap-2 text-gray-700 hover:text-[#155d59] transition-colors text-lg"
              >
                Try it now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right Side - Visual Cards */}
          <div className="relative h-[500px] hidden md:block">
            <div className="absolute top-0 right-0 w-64 h-80 bg-white border-2 border-purple-400 rounded-lg shadow-xl p-4 transform rotate-2">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Welcome Deborah</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" checked readOnly />
                    <span className="text-sm">Complete onboarding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" checked readOnly />
                    <span className="text-sm">Review company policies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" readOnly />
                    <span className="text-sm">Complete first course</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-[#155d59] h-2 rounded-full" style={{ width: "66%" }}></div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-56 h-64 bg-white border-2 border-green-400 rounded-lg shadow-xl p-4 transform -rotate-2">
              <h3 className="font-semibold mb-3">People progress summary</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sales</span>
                  <div className="w-24 h-3 bg-gray-200 rounded-full">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Marketing</span>
                  <div className="w-24 h-3 bg-gray-200 rounded-full">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Support</span>
                  <div className="w-24 h-3 bg-gray-200 rounded-full">
                    <div className="bg-purple-500 h-3 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-8 right-8 w-52 h-56 bg-white border-2 border-green-400 rounded-lg shadow-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div>
                  <h4 className="font-semibold">Deborah Hammink</h4>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★★★★★</span>
                    <span className="text-sm text-gray-600">4.5</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Communication</span>
                  <span className="text-[#155d59]">85%</span>
                </div>
                <div className="flex justify-between">
                  <span>Leadership</span>
                  <span className="text-[#155d59]">72%</span>
                </div>
                <div className="flex justify-between">
                  <span>Technical</span>
                  <span className="text-[#155d59]">90%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

