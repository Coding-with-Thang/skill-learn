"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  ChevronRight,
  Calendar,
  Clock,
  Download,
  Layout,
  Users,
  Target,
  MapPin,
  TrendingUp,
  ArrowRight,
  Quote,
  CheckCircle2,
  Building2
} from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";
import { Card, CardContent } from "@skill-learn/ui/components/card";
import { cn } from "@skill-learn/lib/utils";

export default function CaseStudyPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const snapshot = [
    { icon: Building2, label: "Industry", value: "Fintech & Payments", color: "text-blue-600 bg-blue-50" },
    { icon: Users, label: "Company Size", value: "500 - 2,000 Employees", color: "text-indigo-600 bg-indigo-50" },
    { icon: Layout, label: "Modules Used", value: "Gamified Learning, Analytics", color: "text-emerald-600 bg-emerald-50" },
    { icon: MapPin, label: "Location", value: "San Francisco, USA", color: "text-orange-600 bg-orange-50" }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans pb-24">
      {/* Search Header Wrapper (matching mock) */}
      <div className="bg-white border-b border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-end gap-6">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search case studies..."
              className="w-full h-8 pl-8 pr-4 bg-slate-50 border-none rounded-full text-xs focus:ring-1 focus:ring-brand-teal/20"
            />
            <Target className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>
          <Button variant="ghost" className="h-8 text-xs font-bold text-slate-600 px-3">Schedule Demo</Button>
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-100 overflow-hidden">
            <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=7" alt="User" width={32} height={32} />
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ol className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <li><Link href="/" className="hover:text-brand-teal transition-colors">Home</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li><Link href="/resources" className="hover:text-brand-teal transition-colors">Resources</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li className="text-slate-600">Case Studies</li>
        </ol>
      </nav>

      {/* Hero Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-brand-teal/10 text-brand-teal rounded-full text-[10px] font-black uppercase tracking-wider">SUCCESS STORY</span>
              <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Clock className="w-3 h-3" /> 8 min read
              </span>
            </div>
            <h1 className="text-4xl md:text-brand-teal lg:text-6xl font-extrabold text-[#1B1B53] mb-8 leading-[1.1] tracking-tight">
              How TechFlow increased employee productivity by <span className="text-[#00D181]">40%</span> using Skill-Learn
            </h1>
            <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Oct 24, 2024</span>
              <span className="flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Updated 2 days ago</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[400px] rounded-[40px] overflow-hidden shadow-2xl"
          >
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop"
              alt="TechFlow Office"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Main Study Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Left Column: Snapshot & Progress */}
          <aside className="lg:col-span-3 space-y-8">
            <Card className="rounded-[32px] border-none shadow-sm overflow-hidden p-8 bg-white">
              <h3 className="text-lg font-extrabold text-[#1B1B53] mb-8">Case Study Snapshot</h3>
              <div className="space-y-6">
                {snapshot.map((item, idx) => (
                  <div key={idx} className="bg-slate-50/50 rounded-4xl p-4 flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
                    <div className={cn("p-2.5 rounded-xl shrink-0 group-hover:scale-110 transition-transform", item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                      <p className="text-xs font-black text-[#1B1B53]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full h-14 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-xl mt-8 flex items-center gap-3 font-bold group">
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                Download PDF
              </Button>
            </Card>

            <div className="px-4">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-black text-[#1B1B53] uppercase tracking-widest">Reading Progress</span>
                <span className="text-[10px] font-black text-brand-teal tracking-widest">45%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-brand-teal w-[45%]" />
              </div>
            </div>
          </aside>

          {/* Right Column: Narrative */}
          <div className="lg:col-span-9 space-y-20">

            {/* Section 1: Challenge */}
            <motion.section {...fadeInUp}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-1 bg-brand-teal rounded-full" />
                <h2 className="text-2xl font-black text-[#1B1B53] uppercase tracking-wider">The Challenge</h2>
              </div>
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  TechFlow was experiencing a significant bottleneck in their engineering team's onboarding process. With a <b>rapidly growing headcount</b>, the traditional manual mentorship model was failing to scale. Senior engineers were spending up to 15 hours per week teaching basic architecture principles to new hires, leading to project delays and burnout.
                </p>
                <ul className="space-y-4 text-slate-600">
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 bg-brand-teal rounded-full shrink-0" />
                    <span>Average onboarding time exceeded 45 days.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 bg-brand-teal rounded-full shrink-0" />
                    <span>Inconsistent training quality across different departments.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 bg-brand-teal rounded-full shrink-0" />
                    <span>High churn rate within the first 6 months due to "skill gaps."</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 bg-brand-teal rounded-full shrink-0" />
                    <span>Loss of over $2M annually in developer productivity.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-12 bg-white border-l-4 border-brand-teal rounded-4xl-3xl p-10 shadow-sm italic relative">
                <Quote className="absolute top-6 left-6 w-12 h-12 text-brand-teal/5" />
                <p className="text-xl text-[#1B1B53] font-medium leading-relaxed mb-6">
                  "We reached a point where our growth was actually hurting our velocity. We needed a way to automate knowledge transfer without losing the human element of mentorship."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
                    <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Gavin" alt="Gavin Jenkins" fill />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-[#1B1B53]">Gavin Jenkins</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CTO, TechFlow</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Section 2: Solution */}
            <motion.section {...fadeInUp}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-1 bg-brand-teal rounded-full" />
                <h2 className="text-2xl font-black text-[#1B1B53] uppercase tracking-wider">The Solution</h2>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed mb-12">
                TechFlow implemented Skill-Learn's Enterprise platform, focusing on the <b>Gamified Learning</b> and <b>Custom Analytics</b> modules. The solution was rolled out in three phases:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <h4 className="text-brand-teal font-black mb-4">01. Centralized Academy</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">Consolidated all internal documentation into interactive learning paths.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <h4 className="text-brand-teal font-black mb-4">02. Skills Assessment</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">Automated testing to identify specific knowledge gaps before projects start.</p>
                </div>
              </div>
            </motion.section>

            {/* Section 3: Results */}
            <motion.section {...fadeInUp}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-1 bg-brand-teal rounded-full" />
                <h2 className="text-2xl font-black text-[#1B1B53] uppercase tracking-wider">The Results</h2>
              </div>

              <Card className="rounded-[40px] border-none shadow-sm p-12 bg-white mb-12">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">IMPACT ANALYSIS</span>
                    <h3 className="text-2xl font-black text-[#1B1B53]">Productivity Growth Rate</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-brand-teal">+40%</div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Year-over-Year</span>
                  </div>
                </div>

                {/* Visual Bar Graph mockup */}
                <div className="flex items-end gap-4 h-48">
                  <div className="flex-1 bg-slate-50 rounded-xl h-[30%] relative group">
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 text-center w-full">Pre-Implementation</div>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl h-[45%]" />
                  <div className="flex-1 bg-brand-teal rounded-xl h-[75%]" />
                  <div className="flex-1 bg-brand-teal rounded-xl h-full relative group">
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 text-center w-full">Post-Implementation</div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 text-center space-y-2 hover:translate-y-[-4px] transition-all">
                  <div className="text-3xl font-black text-brand-teal-dark">15d</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Onboarding Reduced</p>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 text-center space-y-2 hover:translate-y-[-4px] transition-all">
                  <div className="text-3xl font-black text-brand-teal-dark">94%</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engagement Rate</p>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 text-center space-y-2 hover:translate-y-[-4px] transition-all">
                  <div className="text-3xl font-black text-brand-teal-dark">2.4x</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ROI in Year 1</p>
                </div>
              </div>
            </motion.section>

          </div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-[#1B1B53] rounded-[48px] p-16 md:p-24 text-center relative overflow-hidden text-white"
        >
          <div className="absolute inset-0 bg-linear-to-br from-brand-teal/20 to-transparent" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-brand-teal font-extrabold mb-8 tracking-tight">Ready to see similar results for your team?</h2>
            <p className="text-lg text-white/70 mb-12 font-medium">Join over 500+ forward-thinking companies using Skill-Learn to scale their engineering talent and boost operational efficiency.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button className="h-14 px-8 bg-brand-teal hover:bg-brand-teal-dark text-white font-black rounded-4xl shadow-xl shadow-brand-teal/20">
                Schedule a Free Demo
              </Button>
              <Button variant="outline" className="h-14 px-8 border-white/20 text-white font-bold rounded-4xl hover:bg-white/10 backdrop-blur-md">
                View All Case Studies
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
