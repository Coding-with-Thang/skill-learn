"use client";

import { useState } from "react";
import { BookOpen, HelpCircle, BarChart3, Gamepad2, Trophy } from "lucide-react";

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
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                  activeTab === tab.id
                    ? "border-[#155d59] bg-[#155d59] text-white"
                    : "border-gray-300 text-gray-700 hover:border-[#155d59] hover:text-[#155d59]"
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : tab.color}`} />
                <span className="font-medium">{tab.id}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content - Placeholder for course interface */}
        <div className="bg-gray-100 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              THE BEST ONLINE COURSES OF ALL-TIME
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50">
                <div className="w-8 h-8 bg-[#155d59] rounded-full flex items-center justify-center text-white font-bold">1</div>
                <span className="text-gray-700">Introduction to Adaptive Learning</span>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50">
                <div className="w-8 h-8 bg-[#155d59] rounded-full flex items-center justify-center text-white font-bold">2</div>
                <span className="text-gray-700">Advanced Skill Development</span>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50">
                <div className="w-8 h-8 bg-[#155d59] rounded-full flex items-center justify-center text-white font-bold">3</div>
                <span className="text-gray-700">Team Performance Optimization</span>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">4</div>
                <span className="text-gray-400">AI-Powered Coaching Strategies</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

