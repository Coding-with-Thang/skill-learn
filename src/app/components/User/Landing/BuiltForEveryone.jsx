"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, TrendingUp, BarChart3, CheckCircle, Target, Zap, Image as ImageIcon } from "lucide-react";

export default function BuiltForEveryone() {
  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "95%", label: "Satisfaction Rate" },
    { number: "2.5x", label: "Faster Development" },
  ];

  return (
    <section id="solutions" className="relative bg-gradient-to-b from-slate-50 via-blue-50/30 to-white py-20 md:py-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.05),transparent_50%)]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-blue-600/20">
            <CheckCircle className="w-4 h-4" />
            Trusted by Industry Leaders
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Built{" "}
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 bg-clip-text text-transparent">
              for everyone
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            From startups to Fortune 500 companies, thousands of businesses trust Skill-Learn
            to transform their employee development strategy
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 md:gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4 md:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100/50 hover:shadow-md hover:border-blue-200 transition-all">
              <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Horizontal Bento Grid */}
        <div className="space-y-6 mb-12">

          {/* Row 1: Large Hero Card (Professionals) */}
          <Card className="group border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="order-2 md:order-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-600/20">
                    <Users className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    For Professionals
                  </h3>

                  <p className="text-base text-gray-600 leading-relaxed mb-5">
                    Make confident hiring decisions with comprehensive candidate insights and project evaluations.
                  </p>

                  <ul className="space-y-2.5 mb-6">
                    {["AI-powered screening", "Skill gap analysis", "Background verification"].map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-600/25">
                    Start Researching
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Image Placeholder */}
                <div className="order-1 md:order-2 relative w-full h-56 md:h-72 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-200 group-hover:border-blue-400 transition-colors backdrop-blur-sm">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-blue-600 font-medium">Candidate Dashboard</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Row 2: Two Medium Cards Side by Side */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Managers Card */}
            <Card className="group border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-purple-50/30">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-600/20">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  For Managers & Leaders
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-grow">
                  Real-time dashboards showing team performance and growth trends at a glance.
                </p>

                {/* Image Placeholder */}
                <div className="relative w-full h-44 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl mb-4 flex items-center justify-center border-2 border-dashed border-purple-200 group-hover:border-purple-400 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs text-purple-600 font-medium">Team Analytics</p>
                  </div>
                </div>

                <ul className="space-y-2">
                  {["Performance tracking", "Custom reports", "Growth analysis"].map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* HR Card */}
            <Card className="group border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/20">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  For HR & People Ops
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-grow">
                  Track development journeys and measure learning impact across your organization.
                </p>

                {/* Image Placeholder */}
                <div className="relative w-full h-44 bg-gradient-to-br from-blue-50 to-indigo-100/50 rounded-xl mb-4 flex items-center justify-center border-2 border-dashed border-blue-200 group-hover:border-blue-400 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-blue-600 font-medium">Progress Tracking</p>
                  </div>
                </div>

                <ul className="space-y-2">
                  {["Adaptive learning", "ROI measurement", "Certification tracking"].map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Employee Intelligence - Horizontal Split */}
          <Card className="group border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-5 gap-6 items-center">
                <div className="md:col-span-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/20">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    Unified Employee Intelligence
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Centralize all employee data, skills, certifications, and progress in one powerful platform.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["360° profiles", "Real-time sync", "Custom fields", "Advanced filtering"].map((highlight, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-blue-600/10 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-600/20"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Image Placeholder */}
                <div className="md:col-span-2 w-full h-52 md:h-64 bg-gradient-to-br from-blue-50 to-purple-100/50 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-200 group-hover:border-blue-400 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-blue-600 font-medium">Data Platform</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Row 4: AI Coaching - Horizontal Split (Reversed) */}
          <Card className="group border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-purple-50/30">
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-5 gap-6 items-center">
                {/* Image Placeholder */}
                <div className="md:col-span-2 order-2 md:order-1 w-full h-52 md:h-64 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl flex items-center justify-center border-2 border-dashed border-purple-200 group-hover:border-purple-400 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-purple-600 font-medium">AI Coach Interface</p>
                  </div>
                </div>

                <div className="md:col-span-3 order-1 md:order-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-600/20">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    AI-Powered Coaching at Scale
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Deliver personalized coaching to every employee automatically with smart, adaptive learning paths.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Personalized feedback", "Smart recommendations", "24/7 availability", "Progress insights"].map((highlight, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-purple-600/10 text-purple-700 px-3 py-1 rounded-full text-xs font-medium border border-purple-600/20"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-2xl p-8 md:p-10 shadow-2xl shadow-blue-600/20">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your team?
          </h3>
          <p className="text-blue-100 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of companies using Skill-Learn to develop their workforce
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold text-lg px-8 shadow-lg">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-black hover:text-gray-400 hover:bg-white/10 font-semibold text-lg px-8 backdrop-blur-sm">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}