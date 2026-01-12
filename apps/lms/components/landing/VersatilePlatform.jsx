"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@skill-learn/ui/components/button";
import { BookOpen, HelpCircle, BarChart3, Gamepad2, Trophy, ArrowRight } from "lucide-react";

export default function VersatilePlatform() {
  const [activeTab, setActiveTab] = useState("Courses");
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef({});
  const tabsWrapperRef = useRef(null);

  const tabs = [
    { id: "Courses", icon: BookOpen, color: "text-purple-600" },
    { id: "Quizzes", icon: HelpCircle, color: "text-blue-600" },
    { id: "Dashboards", icon: BarChart3, color: "text-indigo-600" },
    { id: "Games", icon: Gamepad2, color: "text-violet-600" },
    { id: "Rewards", icon: Trophy, color: "text-fuchsia-600" },
  ];

  const tabContent = {
    Courses: {
      title: "Endless variety of topics",
      description:
        "Whether you're looking to grow a new skill, improve existing ones, or simply explore new interests, Skill-Learn has something for everyone.",
      boxTitle: "THE BEST ONLINE COURSES OF ALL-TIME",
      items: [
        "Business & Entrepreneurship",
        "Technology & Programming",
        "Design & Creativity",
        "Leadership & Management",
      ],
    },
    Quizzes: {
      title: "Test your knowledge",
      description:
        "Challenge yourself with interactive quizzes designed to reinforce learning and track your progress across all topics.",
      boxTitle: "POPULAR QUIZ CATEGORIES",
      items: [
        "Multiple Choice Assessments",
        "Timed Challenges",
        "Skill Certification Tests",
        "Daily Knowledge Checks",
      ],
    },
    Dashboards: {
      title: "Track your progress",
      description:
        "Visualize your learning journey with comprehensive analytics and insights that help you stay motivated and on track.",
      boxTitle: "DASHBOARD FEATURES",
      items: [
        "Real-time Progress Tracking",
        "Performance Analytics",
        "Goal Setting & Milestones",
        "Learning Streak Indicators",
      ],
    },
    Games: {
      title: "Learn through play",
      description:
        "Make learning fun with gamified experiences that boost engagement and retention while you master new skills.",
      boxTitle: "GAME-BASED LEARNING",
      items: [
        "Interactive Simulations",
        "Competitive Challenges",
        "Team-based Activities",
        "Skill-building Mini-games",
      ],
    },
    Rewards: {
      title: "Earn as you learn",
      description:
        "Get recognized for your achievements with badges, certificates, and rewards that showcase your expertise and dedication.",
      boxTitle: "REWARD SYSTEM",
      items: [
        "Achievement Badges",
        "Course Completion Certificates",
        "Skill Redemption",
        "Exclusive Offers",
      ],
    },
  };

  // Position the indicator under the active tab
  useEffect(() => {
    function updateIndicator() {
      const activeEl = tabRefs.current[activeTab];
      const container = tabsWrapperRef.current;
      if (!activeEl || !container) return;

      const activeRect = activeEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const left = activeRect.left - containerRect.left + container.scrollLeft;
      const width = activeRect.width;

      setIndicatorStyle({ left, width });
    }

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">The Most Versatile Work Management Platform</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Maximize your team&apos;s performance, accelerate growth, improve customer experience with our unique and
          extensive customization features that make work seamless for any team or department.
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div ref={tabsWrapperRef} className="flex flex-wrap justify-center gap-4 mb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[tab.id] = el)}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center text-xl gap-2 px-6 py-2 transition-all ${activeTab === tab.id ? "rounded-lg font-bold" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  aria-current={activeTab === tab.id ? "true" : undefined}
                >
                  <Icon className={`w-5 h-5 ${tab.color}`} />
                  <span className={`font-medium ${activeTab === tab.id ? tab.color : "text-gray-700"}`}>{tab.id}</span>
                </button>
              );
            })}
          </div>

          {/* Indicator bar */}
          <div className="relative w-full h-1 mt-1">
            <div
              className="absolute top-0 h-1 bg-purple-600 transition-all duration-300 ease-in-out rounded-full"
              style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            />
            <div className="w-full border-t border-gray-300" />
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50 rounded-lg p-8 min-h-[320px] mt-6">
          <div className="bg-white rounded-lg shadow-lg px-8 py-6 w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900">{tabContent[activeTab].title}</h3>
                <p className="text-lg text-gray-600 leading-relaxed">{tabContent[activeTab].description}</p>
                <Link href="/" className="inline-flex items-center gap-2 text-brand-teal hover:text-brand-teal-dark font-medium text-lg">
                  Learn more
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 min-h-[240px] flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">{tabContent[activeTab].boxTitle}</h4>
                  <div className="space-y-3">
                    {tabContent[activeTab].items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 border border-gray-200 rounded">
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <Button variant="outline" size="lg" className="px-6 py-3 text-xl bg-brand-teal text-white hover:bg-brand-teal-dark hover:text-white border-transparent">
            View Demo
          </Button>
          <Button variant="ghost" size="lg" className="px-6 py-3 text-xl text-brand-teal hover:bg-brand-teal/5">
            See all features
          </Button>
        </div>
      </div>
    </section>
  );
}