"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, HelpCircle, BarChart3, Gamepad2, Trophy, ArrowRight } from "lucide-react";

export default function VersatilePlatform() {
  const [activeTab, setActiveTab] = useState("Courses");

  const tabs = [
    { id: "Courses", icon: BookOpen, color: "text-green-600" },
    { id: "Quizzes", icon: HelpCircle, color: "text-orange-600" },
    { id: "Dashboards", icon: BarChart3, color: "text-blue-600" },
    { id: "Games", icon: Gamepad2, color: "text-red-600" },
    { id: "Rewards", icon: Trophy, color: "text-yellow-600" },
  ];

  return (
    <section id="platform" className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            The Most Versatile Work Management Platform
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Maximize your team's performance, accelerate growth, improve customer experience with our unique and extensive customization features that makes work seamless for any team or department.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center text-xl text-semibold gap-2 px-6 py-1 transition-all ${activeTab === tab.id
                  ? "border-[#155d59] bg-[#155d59] text-white rounded-lg border-2"
                  : "text-gray-700 hover:border-[#155d59] hover:text-[#155d59]"
                  }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : tab.color}`} />
                <span className="font-medium">{tab.id}</span>
              </button>
            );
          })}
          <hr className="w-full border-t border-gray-300" />
        </div>

        {/* Tab Content */}
        <div className="bg-gray-100 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg px-8 py-3 w-full">
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
                      href="/"
                      className="inline-flex items-center gap-2 text-[#155d59] hover:text-[#124a47] font-medium text-lg"
                    >
                      Learn more
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>

                  {/* Right Side - Image */}
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
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-12">
          <Button
            variant="outline"
            size="lg"
            className="px-4 py-2 text-3xl bg-[#3d2c03] text-white hover:cursor"
          >
            View Demo
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="px-4 py-2 text-3xl text-[#322] hover:cursor"
          >
            See all features
          </Button>
        </div>
      </div>
    </section>
  );
}

