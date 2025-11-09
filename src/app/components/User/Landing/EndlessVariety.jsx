"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function EndlessVariety() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Endless variety of topics
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Whether you're looking to grow a new skill, improve existing ones, or simply explore new interests, Skill-Learn has something for everyone.
            </p>
            <Link 
              href="/categories" 
              className="inline-flex items-center gap-2 text-[#155d59] hover:text-[#124a47] font-medium text-lg"
            >
              Learn more
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Right Side - Image Placeholder */}
          <div className="bg-gray-100 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                THE BEST ONLINE COURSES OF ALL-TIME
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 border border-gray-200 rounded">
                  <span className="text-gray-700">Business & Entrepreneurship</span>
                </div>
                <div className="flex items-center gap-3 p-2 border border-gray-200 rounded">
                  <span className="text-gray-700">Technology & Programming</span>
                </div>
                <div className="flex items-center gap-3 p-2 border border-gray-200 rounded">
                  <span className="text-gray-700">Design & Creativity</span>
                </div>
                <div className="flex items-center gap-3 p-2 border border-gray-200 rounded">
                  <span className="text-gray-700">Leadership & Management</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

