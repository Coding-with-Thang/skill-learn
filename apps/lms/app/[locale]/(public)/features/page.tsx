"use client";

import { useTranslations } from "next-intl";
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
import { Link } from "@/i18n/navigation";
import { Button } from "@skill-learn/ui/components/button";
import { Card, CardContent } from "@skill-learn/ui/components/card";

export default function FeaturesPage() {
  const t = useTranslations("features");
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      id: "gamification",
      tagKey: "gamificationTag",
      titleKey: "gamificationTitle",
      descKey: "gamificationDesc",
      highlights: [
        { labelKey: "gamificationH1", subKey: "gamificationH1Sub" },
        { labelKey: "gamificationH2", subKey: "gamificationH2Sub" },
        { labelKey: "gamificationH3", subKey: "gamificationH3Sub" }
      ],
      image: "gamification_dashboard_ui_1768456006376.png",
      reverse: false,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      id: "quiz-builder",
      tagKey: "quizBuilderTag",
      titleKey: "quizBuilderTitle",
      descKey: "quizBuilderDesc",
      highlights: [
        { labelKey: "quizBuilderH1", subKey: "quizBuilderH1Sub" },
        { labelKey: "quizBuilderH2", subKey: "quizBuilderH2Sub" },
        { labelKey: "quizBuilderH3", subKey: "quizBuilderH3Sub" }
      ],
      image: "quiz_builder_interface_1768456021921.png",
      reverse: true,
      color: "bg-blue-50 text-blue-600"
    },
    {
      id: "analytics",
      tagKey: "analyticsTag",
      titleKey: "analyticsTitle",
      descKey: "analyticsDesc",
      highlights: [
        { labelKey: "analyticsH1", subKey: "analyticsH1Sub" },
        { labelKey: "analyticsH2", subKey: "analyticsH2Sub" },
        { labelKey: "analyticsH3", subKey: "analyticsH3Sub" }
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
              {t("platformFeatures")}
            </span>
            <h1 className="text-brand-teal md:text-7xl font-extrabold text-[#1B1B53] mb-8 tracking-tight max-w-4xl mx-auto leading-[1.05]">
              {t("heroTitle")} <span className="text-[#00D181]">{t("heroTitleHighlight")}</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12">
              {t("heroSubtitle")}
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
                  {t(feature.titleKey)}
                </h2>
                <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                  {t(feature.descKey)}
                </p>

                <div className="space-y-8">
                  {feature.highlights.map((h, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="mt-1 w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 mb-1">{t(h.labelKey)}</h4>
                        <p className="text-sm text-slate-500">{t(h.subKey)}</p>
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
                    alt={t(feature.titleKey)}
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
            <span className="text-xs font-black text-brand-teal uppercase tracking-[0.3em] mb-4 block">{t("successStories")}</span>
            <h2 className="text-4xl md:text-brand-teal font-extrabold text-[#1B1B53] tracking-tight">{t("trustedBy")}</h2>
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
                  "{t("caseStudyQuote")}"
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
                  <span className="text-[10px] font-black text-[#00D181] uppercase tracking-[0.2em]">{t("theChallenge")}</span>
                  <p className="text-slate-600 font-medium">{t("challengeText")}</p>
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-[#00D181] uppercase tracking-[0.2em]">{t("theSolution")}</span>
                  <p className="text-slate-600 font-medium">{t("solutionText")}</p>
                </div>
                <div className="pt-8 border-t border-slate-200/50">
                  <span className="text-[10px] font-black text-[#00D181] uppercase tracking-[0.2em] mb-4 block">{t("theResult")}</span>
                  <div className="text-4xl font-black text-[#1B1B53]">{t("result92")}</div>
                </div>
                <Link href="/resources/case-studies/techflow" className="block">
                  <Button className="w-full h-14 bg-[#1B1B53] hover:bg-[#1B1B53]/90 text-white rounded-4xl font-bold">
                    {t("readFullCaseStudy")}
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
              {t("readyToTransform")}
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12">
              {t("joinOver500")}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="h-16 px-10 bg-[#00D181] hover:bg-[#00B871] text-brand-dark-blue font-black text-lg rounded-4xl shadow-xl shadow-emerald-500/20">
                {t("startFreeTrial")}
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 border-2 border-white/20 text-white hover:bg-white/10 font-bold text-lg rounded-4xl backdrop-blur-md">
                {t("scheduleDemo")}
              </Button>
            </div>
            <p className="mt-8 text-white/40 text-sm">{t("noCreditCard")}</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
