"use client";

import { motion } from "framer-motion";
import {
  Map,
  Home,
  CreditCard,
  Briefcase,
  ShieldCheck,
  HelpCircle,
  FileText,
  User,
  LayoutDashboard,
  Zap,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const sitemapSections = [
  {
    title: "Public Pages",
    icon: Home,
    links: [
      { name: "Home", href: "/" },
      { name: "Pricing", href: "/pricing" },
      { name: "Legal Hub", href: "/legal" },
      { name: "About Us", href: "/about" },
    ],
  },
  {
    title: "Legal & Compliance",
    icon: ShieldCheck,
    links: [
      { name: "Privacy Policy", href: "/legal/privacy-policy" },
      { name: "Terms & Conditions", href: "/legal/terms-of-condition" },
      { name: "Accessibility Statement", href: "/legal/accessibility" },
      { name: "Data Protection & Compliance", href: "/legal/compliance" },
    ],
  },
  {
    title: "Product Flow",
    icon: Zap,
    links: [
      { name: "Sign In", href: "/sign-in" },
      { name: "Join Community", href: "/onboarding/welcome" },
      { name: "Account Setup", href: "/onboarding/account" },
    ],
  },
  {
    title: "Platform",
    icon: BookOpen,
    links: [
      { name: "Dashboard", href: "/user/dashboard" },
      { name: "Community Feed", href: "/user/community" },
      { name: "Learning Paths", href: "/user/paths" },
      { name: "Rewards Center", href: "/user/rewards" },
      { name: "My Profile", href: "/user/profile" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans pb-24">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-100 pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-teal/5 text-brand-teal rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Map className="w-3 h-3" />
              Sitemap
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Site Navigation
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed mx-auto md:mx-0">
              An organized directory of all available pages and resources within the Skill-Learn platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sitemap Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {sitemapSections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                    <Icon className="w-5 h-5 text-brand-teal" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                </div>

                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="group flex items-center justify-between text-slate-500 hover:text-brand-teal transition-colors font-medium"
                      >
                        {link.name}
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Discovery CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-sm text-center">
          <HelpCircle className="w-12 h-12 text-brand-teal mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Can't find what you're looking for?</h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto leading-relaxed">
            Our support team is available 24/7 to help you navigate our platform and find the resources you need.
          </p>
          <button className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg">
            Chat with Support
          </button>
        </div>
      </section>
    </div>
  );
}
