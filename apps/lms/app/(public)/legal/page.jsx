"use client";

import { motion } from "framer-motion";
import {
  Shield,
  FileText,
  Lock,
  Accessibility,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Scale,
  Building,
  Info,
} from "lucide-react";
import Link from "next/link";

const legalPages = [
  {
    title: "Privacy Policy",
    description: "Learn how we handle and protect your personal data.",
    href: "/legal/privacy-policy",
    icon: Lock,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Terms & Conditions",
    description: "The rules and regulations for using our platform.",
    href: "/legal/terms-of-condition",
    icon: FileText,
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Accessibility",
    description: "Our commitment to making learning accessible to everyone.",
    href: "/legal/accessibility",
    icon: Accessibility,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Security & Compliance",
    description: "Enterprise-grade data protection and certifications.",
    href: "/legal/compliance",
    icon: Shield,
    color: "bg-slate-50 text-slate-600",
  },
];

export default function LegalHubPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Legal Hub
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
              Find all the legal documentation, policies, and compliance statements for the Skill-Learn platform in one place.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {legalPages.map((page, index) => (
            <motion.div
              key={page.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={page.href}
                className="group block bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-teal/20 transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className={`p-4 rounded-2xl ${page.color} group-hover:scale-110 transition-transform`}>
                    <page.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-brand-teal transition-colors">
                      {page.title}
                    </h2>
                    <p className="text-slate-500 leading-relaxed mb-6">
                      {page.description}
                    </p>
                    <div className="flex items-center text-sm font-bold text-brand-teal group-hover:gap-2 transition-all">
                      Read Documentation <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Contact/Support Section */}
        <section className="mt-20">
          <div className="bg-brand-dark-blue rounded-[40px] p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl text-center md:text-left">
                <h3 className="text-3xl font-bold mb-4">Have questions about our terms?</h3>
                <p className="text-white/70 text-lg">Our legal team is here to help you understand our policies and how they apply to your organization.</p>
              </div>
              <Link
                href="mailto:legal@skill-learn.ca"
                className="px-8 py-4 bg-brand-teal text-white font-bold rounded-2xl hover:bg-brand-teal-dark transition-all shadow-lg hover:shadow-brand-teal/20"
              >
                Contact Legal Support
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
