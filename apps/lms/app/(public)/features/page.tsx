"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Gamepad2,
  Target,
  Zap,
  BarChart3,
  CheckCircle2,
  MousePointer2,
  Lightbulb,
  Layout,
  LineChart,
  ShieldCheck,
  Globe,
  ArrowRight,
  MessageSquare,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@skill-learn/ui/components/button";
import { Card, CardContent } from "@skill-learn/ui/components/card";

export default function FeaturesPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      id: "gamification",
      tag: "LEVEL UP ENGAGEMENT",
      title: "Advanced Gamification",
      description: "Boost employee engagement with immersive learning mechanics. Our platform transforms repetitive training into an achievement-driven experience that teams actually enjoy.",
      highlights: [
        { label: "Achievement Badges", sub: "Reward milestones with custom digital badges." },
        { label: "Global Leaderboards", sub: "Drive healthy competition with department rankings." },
        { label: "Point Systems", sub: "Earn points for course completion and unlock rewards." }
      ],
      image: "gamification_dashboard_ui_1768456006376.png",
      reverse: false,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      id: "quiz-builder",
      tag: "SMARTER ASSESSMENTS",
      title: "Intuitive Quiz Builder",
      description: "Create comprehensive assessments in minutes, not hours. Our drag-and-drop interface makes evaluation simple, effective, and visually engaging for learners.",
      highlights: [
        { label: "Drag-and-Drop", sub: "Build quizzes without any technical knowledge." },
        { label: "Instant Feedback", sub: "Provide immediate results and explanations to learners." },
        { label: "AI Suggestions", sub: "Automatically generate questions from your course content." }
      ],
      image: "quiz_builder_interface_1768456021921.png",
      reverse: true,
      color: "bg-blue-50 text-blue-600"
    },
    {
      id: "analytics",
      tag: "MEASURE SUCCESS",
      title: "Enterprise Analytics",
      description: "Make data-driven decisions with deep insights into learner performance and ROI tracking. Understand your team's skill landscape like never before.",
      highlights: [
        { label: "Real-time Tracking", sub: "Monitor completion rates as they happen across global teams." },
        { label: "Skill Gap Analysis", sub: "Identify where your workforce needs more training." },
        { label: "Custom Reporting", sub: "Export tailored reports for stakeholders with one click." }
      ],
      image: "analytics_dashboard_saas_1768456040846.png",
      reverse: false,
      color: "bg-brand-teal/10 text-brand-teal"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 bg-[#F8F9FB]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,209,129,0.05),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-bold uppercase tracking-widest mb-8">
              Platform Features
            </span>
            <h1 className="text-brand-teal md:text-7xl font-extrabold text-[#1B1B53] mb-8 tracking-tight max-w-4xl mx-auto leading-[1.05]">
              Powering the next generation of <span className="text-[#00D181]">corporate learning.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12">
              Everything you need to train your team, track performance, and scale your organization's knowledge base in one intuitive platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature Sections */}
      <div className="space-y-32 py-20 md:py-32">
        {features.map((feature, idx) => (
          <section key={feature.id} id={feature.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${feature.reverse ? 'lg:flex-row-reverse' : ''}`}>

              {/* Content */}
              <motion.div
                {...fadeInUp}
                className={feature.reverse ? 'lg:order-2' : ''}
              >
                <div className={`w-12 h-12 rounded-4xl ${feature.color} flex items-center justify-center mb-8 shadow-sm`}>
                  {idx === 0 ? <Gamepad2 className="w-6 h-6" /> : idx === 1 ? <Layout className="w-6 h-6" /> : <BarChart3 className="w-6 h-6" />}
                </div>
                <h2 className="text-4xl font-extrabold text-[#1B1B53] mb-6 tracking-tight">
                  {feature.title}
                </h2>
                <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                  {feature.description}
                </p>

                <div className="space-y-8">
                  {feature.highlights.map((h, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="mt-1 w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 mb-1">{h.label}</h4>
                        <p className="text-sm text-slate-500">{h.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Image Visual */}
              <motion.div
                {...fadeInUp}
                className={`relative ${feature.reverse ? 'lg:order-1' : ''}`}
              >
                <div className="relative rounded-[40px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.08)] bg-slate-100 group">
                  <Image
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop"
                    alt={feature.title}
                    width={800}
                    height={600}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Note: I will replace the src with actual local paths if they were standard, but here I use the generated IDs as reference in comments */}
                  {/* Actual Image: feature.image */}
                </div>

                {/* Decorative floating elements based on mockup styling */}
                <div className="absolute -z-10 -bottom-8 -right-8 w-64 h-64 bg-brand-teal/5 rounded-full blur-3xl" />
              </motion.div>
            </div>
          </section>
        ))}
      </div>

      {/* Success Stories Section */}
      <section className="bg-[#F8F9FB] py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-black text-brand-teal uppercase tracking-[0.3em] mb-4 block">Success Stories</span>
            <h2 className="text-4xl md:text-brand-teal font-extrabold text-[#1B1B53] tracking-tight">Trusted by industry leaders</h2>
          </div>

          <motion.div
            {...fadeInUp}
            className="bg-[#E9FBF3] rounded-[48px] overflow-hidden border border-white/50 shadow-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
              {/* Case Study Content */}
              <div className="lg:col-span-3 p-12 md:p-20">
                <div className="flex items-center gap-2 mb-8">
                  <Target className="w-5 h-5 text-[#00D181]" />
                  <span className="text-xs font-black text-[#1B1B53] uppercase tracking-widest">TechFlow</span>
                </div>
                <h3 className="text-4xl md:text-brand-teal font-extrabold text-[#1B1B53] mb-8 leading-[1.1]">
                  Boosted employee engagement by <span className="text-[#00D181]">45%</span> in six months.
                </h3>
                <blockquote className="text-xl text-slate-600 italic mb-12 border-l-4 border-[#00D181] pl-8 leading-relaxed">
                  "The transition to Skill-Learn was the single most impactful decision we made for our L&D strategy. The automated gamification features didn't just teach our employees; it excited them about learning."
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-300 overflow-hidden">
                    {/* Avatar placeholder */}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Gavin Jenkins</h5>
                    <p className="text-sm text-slate-500">Chief Technology Officer, TechFlow</p>
                  </div>
                </div>
              </div>

              {/* Stats Card Side */}
              <div className="lg:col-span-2 bg-white/40 backdrop-blur-md p-12 flex flex-col justify-center gap-12 border-l border-white/50">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-[#00D181] uppercase tracking-[0.2em]">The challenge</span>
                  <p className="text-slate-600 font-medium">Fragmented learning tools led to low completion rates and zero ROI visibility.</p>
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-[#00D181] uppercase tracking-[0.2em]">The solution</span>
                  <p className="text-slate-600 font-medium">Centralized LMS with Skill-Learn's Enterprise Analytics and AI career pathways.</p>
                </div>
                <div className="pt-8 border-t border-slate-200/50">
                  <span className="text-[10px] font-black text-[#00D181] uppercase tracking-[0.2em] mb-4 block">The result</span>
                  <div className="text-4xl font-black text-[#1B1B53]">92% Certification Rate</div>
                </div>
                <Link href="/resources/case-studies/techflow" className="block">
                  <Button className="w-full h-14 bg-[#1B1B53] hover:bg-[#1B1B53]/90 text-white rounded-4xl font-bold">
                    Read Full Case Study
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          {...fadeInUp}
          className="max-w-6xl mx-auto bg-brand-dark-blue rounded-[56px] p-12 md:p-24 text-center relative overflow-hidden"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >
          <div className="absolute inset-0 bg-brand-dark-blue/90" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
              Ready to transform your corporate training?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12">
              Join over 500+ forward-thinking companies scaling their knowledge with Skill-Learn.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="h-16 px-10 bg-[#00D181] hover:bg-[#00B871] text-brand-dark-blue font-black text-lg rounded-4xl shadow-xl shadow-emerald-500/20">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 border-2 border-white/20 text-white hover:bg-white/10 font-bold text-lg rounded-4xl backdrop-blur-md">
                Schedule Demo
              </Button>
            </div>
            <p className="mt-8 text-white/40 text-sm">No credit card required. 14-day free trial.</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
