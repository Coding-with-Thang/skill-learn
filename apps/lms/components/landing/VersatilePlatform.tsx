"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  HelpCircle,
  BarChart3,
  Gamepad2,
  Trophy,
  ArrowRight,
  Rocket,
  ChevronRight,
  Briefcase,
  Code,
  Palette,
  Sparkles,
  Target,
  CheckCircle2
} from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";
import { useTranslations } from "next-intl";

const TAB_IDS = ["Courses", "Quizzes", "Dashboards", "Games", "Rewards"] as const;
const TAB_CONFIG = [
  { id: "Courses" as const, icon: BookOpen },
  { id: "Quizzes" as const, icon: HelpCircle },
  { id: "Dashboards" as const, icon: BarChart3 },
  { id: "Games" as const, icon: Gamepad2 },
  { id: "Rewards" as const, icon: Trophy },
];

const ITEM_ICONS = {
  Courses: [Briefcase, Code, Palette],
  Quizzes: [HelpCircle, BarChart3, Code],
  Dashboards: [BarChart3, HelpCircle, Briefcase],
  Games: [Gamepad2, Palette, Trophy],
  Rewards: [Trophy, Briefcase, BarChart3],
};

const ITEM_COLORS = {
  Courses: ["bg-blue-50 text-blue-600", "bg-orange-50 text-orange-600", "bg-indigo-600 text-white shadow-xl shadow-indigo-200"],
  Quizzes: ["bg-emerald-50 text-emerald-600", "bg-indigo-600 text-white shadow-xl shadow-indigo-200", "bg-rose-50 text-rose-600"],
  Dashboards: ["bg-indigo-600 text-white shadow-xl shadow-indigo-200", "bg-blue-50 text-blue-600", "bg-amber-50 text-amber-600"],
  Games: ["bg-violet-50 text-violet-600", "bg-teal-50 text-teal-600", "bg-indigo-600 text-white shadow-xl shadow-indigo-200"],
  Rewards: ["bg-indigo-600 text-white shadow-xl shadow-indigo-200", "bg-sky-50 text-sky-600", "bg-purple-50 text-purple-600"],
};

const FLOATING_CONFIG = {
  Courses: { icon: Sparkles, color: "text-amber-400", pos: "-top-8 -right-8" },
  Quizzes: { icon: CheckCircle2, color: "text-emerald-500", pos: "-bottom-10 -left-12" },
  Dashboards: { icon: BarChart3, color: "text-blue-500", pos: "-top-12 -left-10" },
  Games: { icon: Target, color: "text-rose-500", pos: "top-1/2 -right-14 -translate-y-1/2" },
  Rewards: { icon: Trophy, color: "text-amber-500", pos: "-top-10 -right-10" },
};

export default function VersatilePlatform() {
  const t = useTranslations("versatilePlatform");
  const [activeTab, setActiveTab] = useState<(typeof TAB_IDS)[number]>("Courses");

  const tabs = useMemo(() => TAB_CONFIG.map((tab) => ({ ...tab, label: t(`tabs.${tab.id.toLowerCase()}` as "courses" | "quizzes" | "dashboards" | "games" | "rewards") })), [t]);

  const contentKey = activeTab.toLowerCase();
  const CONTENT = useMemo(() => {
    const labels = t.raw(`${contentKey}.items`) as string[];
    const icons = ITEM_ICONS[activeTab];
    const colors = ITEM_COLORS[activeTab];
    return {
      badge: t(`${contentKey}.badge`),
      title: t(`${contentKey}.title`),
      titleAccent: t(`${contentKey}.titleAccent`),
      description: t(`${contentKey}.description`),
      items: labels.map((label, idx) => ({ icon: icons[idx], label, color: colors[idx] })),
      floating: FLOATING_CONFIG[activeTab],
    };
  }, [activeTab, contentKey, t]);

  return (
    <section className="py-12 lg:py-16 relative overflow-hidden bg-slate-50/30 min-h-screen flex flex-col justify-center">

      {/* Header section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8 lg:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-2"
        >
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {t("platformBadge")}
          </span>
          <h2 className="text-4xl md:text-brand-teal lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            {t("headerTitle")} <span className="relative inline-block">
              {t("headerTitleAccent")}
              <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="#6366f1" strokeWidth="4" fill="transparent" strokeLinecap="round" />
              </svg>
            </span> {t("headerSubtitle")}
          </h2>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t("headerDesc")}
          </p>
        </motion.div>
      </div>

      {/* Interactive Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center">

        {/* Simplified Tab Pill */}
        <div className="flex justify-center mb-8 lg:mb-12">
          <div className="inline-flex items-center p-1.5 bg-white rounded-full shadow-xl shadow-slate-200/50 border border-slate-100 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${isActive ? "text-white" : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={`relative z-10 w-3.5 h-3.5 transition-colors`} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center"
          >
            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {CONTENT[activeTab].badge}
                </span>
                <h3 className="text-3xl md:text-4xl lg:text-brand-teal font-black text-slate-900 leading-[1.1] tracking-tight">
                  {CONTENT[activeTab].title} <br />
                  <span className="text-indigo-600">{CONTENT[activeTab].titleAccent}</span>
                </h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-lg font-medium">
                  {CONTENT[activeTab].description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 group text-sm">
                  {t("exploreCatalog")}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" className="h-12 px-6 bg-white text-slate-900 rounded-xl font-bold border-slate-200 text-sm">
                  {t("viewDemo")}
                </Button>
              </div>
            </div>

            {/* Right Visual Dashboard Mockup */}
            <div className="relative scale-90 lg:scale-100 origin-center lg:origin-right">
              {/* Main Card Container */}
              <div className="bg-white rounded-[2.5rem] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.05)] border border-slate-50 relative overflow-hidden group max-w-md mx-auto">
                {/* Platform Frame UI */}
                <div className="bg-slate-50/50 rounded-4xl p-6 lg:p-8 min-h-[300px] flex flex-col justify-center gap-3">
                  {CONTENT[activeTab].items.map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-[1.2rem] transition-all duration-300 text-sm ${item.color}`}
                      >
                        <div className={`p-2.5 rounded-lg ${idx === 2 ? 'bg-white/20' : 'bg-white/80'} shadow-sm`}>
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <span className="font-bold tracking-tight">{item.label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Floating Icons - Moved OUTSIDE overflow-hidden container */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`floating-${activeTab}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -8, 0]
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 },
                    y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                  }}
                  className={`absolute ${CONTENT[activeTab].floating.pos} w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center border border-slate-50 z-2000`}
                >
                  {(() => {
                    const FloatingIcon = CONTENT[activeTab].floating.icon;
                    return <FloatingIcon className={`w-8 h-8 ${CONTENT[activeTab].floating.color}`} />;
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Sticky-style Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 lg:mt-16">
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.02)] gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div className="">
              <h4 className="text-base font-bold text-slate-900">{t("ctaTitle")}</h4>
              <p className="text-[10px] text-slate-500 font-medium">{t("ctaSubtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/features" className="text-indigo-600 text-sm font-bold hover:text-indigo-700 transition-colors flex items-center gap-2 group">
              {t("viewAllFeatures")}
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Button className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs">
              {t("getStartedFree")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
