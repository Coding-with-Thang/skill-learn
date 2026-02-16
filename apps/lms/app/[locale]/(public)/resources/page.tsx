"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  Shield,
  Briefcase,
  Map,
  ChevronRight,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Scale,
  Building2,
  Navigation,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function ResourcesPage() {
  const t = useTranslations("resources");
  
  const resourceCategories = [
    {
      title: t("changelog"),
      description: t("changelogDesc"),
      href: "/changelog",
      icon: Sparkles,
      color: "bg-blue-50 text-blue-600",
      category: t("updates"),
    },
    {
      title: t("helpCenter"),
      description: t("helpCenterDesc"),
      href: "/support/faq",
      icon: HelpCircle,
      color: "bg-teal-50 text-teal-600",
      category: t("support"),
    },
    {
      title: t("legalHub"),
      description: t("legalHubDesc"),
      href: "/legal",
      icon: Scale,
      color: "bg-purple-50 text-purple-600",
      category: t("legal"),
    },
    {
      title: t("caseStudies"),
      description: t("caseStudiesDesc"),
      href: "/resources/case-studies/techflow",
      icon: Briefcase,
      color: "bg-emerald-50 text-emerald-600",
      category: t("resources"),
    },
    {
      title: t("sitemap"),
      description: t("sitemapDesc"),
      href: "/sitemap",
      icon: Navigation,
      color: "bg-slate-50 text-slate-600",
      category: t("navigation"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-100 pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-brand-teal font-bold text-slate-900 mb-6 tracking-tight">
              {t("title")}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
              {t("subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Resources Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resourceCategories.map((resource, index) => (
            <motion.div
              key={resource.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={resource.href}
                className="group block bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-teal/20 transition-all duration-300 h-full"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start gap-6 mb-4">
                    <div className={`p-4 rounded-4xl ${resource.color} group-hover:scale-110 transition-transform shrink-0`}>
                      <resource.icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                        {resource.category}
                      </span>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-brand-teal transition-colors">
                        {resource.title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-slate-500 leading-relaxed mb-6 grow">
                    {resource.description}
                  </p>
                  <div className="flex items-center text-sm font-bold text-brand-teal group-hover:gap-2 transition-all">
                    {t("explore")} <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Links Section */}
        <section className="mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-8">{t("quickLinks")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/changelog"
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-brand-teal/20 hover:shadow-md transition-all group"
              >
                <Sparkles className="w-5 h-5 text-brand-teal" />
                <span className="font-medium text-slate-700 group-hover:text-brand-teal">{t("changelog")}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-brand-teal" />
              </Link>
              <Link
                href="/support/faq"
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-brand-teal/20 hover:shadow-md transition-all group"
              >
                <HelpCircle className="w-5 h-5 text-brand-teal" />
                <span className="font-medium text-slate-700 group-hover:text-brand-teal">{t("helpCenter")}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-brand-teal" />
              </Link>
              <Link
                href="/legal"
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-brand-teal/20 hover:shadow-md transition-all group"
              >
                <Scale className="w-5 h-5 text-brand-teal" />
                <span className="font-medium text-slate-700 group-hover:text-brand-teal">{t("legal")}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-brand-teal" />
              </Link>
              <Link
                href="/sitemap"
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-brand-teal/20 hover:shadow-md transition-all group"
              >
                <Navigation className="w-5 h-5 text-brand-teal" />
                <span className="font-medium text-slate-700 group-hover:text-brand-teal">{t("sitemap")}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-brand-teal" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Contact/Support Section */}
        <section className="mt-20">
          <div className="bg-brand-dark-blue rounded-[40px] p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl text-center md:text-left">
                <h3 className="text-3xl font-bold mb-4">{t("needMoreHelp")}</h3>
                <p className="text-white/70 text-lg">{t("cantFindWhat")}</p>
              </div>
              <Link
                href="/contact"
                className="px-8 py-4 bg-brand-teal text-white font-bold rounded-4xl hover:bg-brand-teal-dark transition-all shadow-lg hover:shadow-brand-teal/20"
              >
                {t("contactSupport")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
