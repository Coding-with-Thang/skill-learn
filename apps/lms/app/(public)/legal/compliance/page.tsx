"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Server,
  Key,
  Database,
  Globe,
  RefreshCw,
  Clock,
  CheckCircle2,
  FileText,
  Download,
  Shield,
  Fingerprint,
  Zap,
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@skill-learn/ui/components/button";
import { cn } from "@skill-learn/lib/utils";

const sections = [
  { id: "overview", name: "Security Overview", icon: Shield },
  { id: "compliance", name: "Compliance & Audits", icon: CheckCircle2 },
  { id: "encryption", name: "Data Encryption", icon: Lock },
  { id: "infrastructure", name: "Infrastructure", icon: Server },
  { id: "privacy", name: "Privacy Policy", icon: Database },
];

const certifications = [
  { name: "SOC2 Type II", icon: ShieldCheck },
  { name: "GDPR Compliant", icon: Globe },
  { name: "ISO 27001", icon: CheckCircle2 },
  { name: "CCPA / HIPAA", icon: Lock },
];

const securityStandards = [
  {
    title: "Encryption at Rest & Transit",
    description: "All data is encrypted at rest using AES-256 with FIPS 140-2 compliant hardware security modules. In transit, data is protected via TLS 1.3 with Perfect Forward Secrecy.",
    icon: Key,
    features: ["AES-256 Encryption", "SHA-256 Hashing"],
  },
  {
    title: "Global Data Residency",
    description: "Select where your primary data resides to meet local regulatory requirements. We offer multi-region availability across AWS and Azure infrastructure.",
    icon: Globe,
    features: ["US, EU, and APAC Regions", "Local Data Siloing"],
  },
  {
    title: "Disaster Recovery",
    description: "Real-time streaming replication to multi-AZ secondary databases. Continuous backups are stored in durable object storage with versioning enabled.",
    icon: Database,
    features: ["1-hour Recovery Point Objective (RPO)", "4-hour Recovery Time Objective (RTO)"],
  },
  {
    title: "Identity & Access Control",
    description: "Granular Role-Based Access Control (RBAC) and support for enterprise SSO (SAML 2.0, OIDC). Multi-factor authentication is mandatory for all administrative actions.",
    icon: Fingerprint,
    features: ["SSO & MFA Integration", "Audit Logs for all Events"],
  },
];

const technicalSpecs = [
  { parameter: "Transport Layer Security", protocol: "TLS 1.3 / 1.2 Minimum", status: "MANDATORY", statusColor: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  { parameter: "API Authentication", protocol: "OAuth 2.0 / Bearer Tokens", status: "ACTIVE", statusColor: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  { parameter: "Log Retention", protocol: "12-Month Audit Trail", status: "STANDARD", statusColor: "text-blue-700 bg-blue-50 border-blue-100" },
  { parameter: "Pentesting Frequency", protocol: "Quarterly 3rd-Party Audits", status: "VERIFIED", statusColor: "text-purple-700 bg-purple-50 border-purple-100" },
];

export default function CompliancePage() {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-100 pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <span className="hover:text-brand-teal cursor-pointer">Security Center</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">Compliance</span>
          </nav>

          <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider mb-6">
            <RefreshCw className="w-3 h-3 mr-2" />
            Version 2.4 - Effective July 2024
          </div>

          <h1 className="text-4xl md:text-brand-teal font-bold mb-6 tracking-tight">
            Enterprise-Grade <span className="text-emerald-600">Data Protection</span> & Compliance
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
            Skill-Learn utilizes defense-in-depth security strategies, AES-256 encryption, and global compliance standards to ensure your workforce data remains private and secure.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">

        {/* Sticky Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-10 space-y-8">
            <div className="bg-white rounded-4xl p-6 shadow-sm border border-slate-100">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">On this page</p>
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group",
                        isActive
                          ? "bg-emerald-50 text-emerald-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-500"
                      )} />
                      {section.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="bg-emerald-600 rounded-4xl p-6 text-white shadow-lg shadow-emerald-600/20">
              <p className="text-[10px] uppercase tracking-widest text-emerald-100/60 font-bold mb-2">Need more info?</p>
              <p className="text-xs text-emerald-50 leading-relaxed mb-6">Contact our Data Protection Officer for detailed inquiries.</p>
              <button className="w-full py-2.5 bg-white text-emerald-600 text-xs font-bold rounded-xl transition-all hover:bg-emerald-50 shadow-md">
                Contact DPO
              </button>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <div className="flex-1 max-w-4xl">
          {/* Key Stats Grid */}
          <section id="overview" className="mb-20 scroll-mt-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Uptime SLA", value: "99.99%", detail: "Verified", icon: Activity },
                { label: "Encryption", value: "AES-256", detail: "Standard Protocol", icon: Lock },
                { label: "Backup Frequency", value: "Hourly", detail: "Point-in-Time (PITR)", icon: Clock },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-4xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1.5 font-semibold">
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Compliance Grid */}
          <section id="compliance" className="mb-24 scroll-mt-20">
            <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">Global Compliance Certifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {certifications.map((cert) => (
                <div key={cert.name} className="bg-white border border-slate-100 rounded-4xl p-8 flex flex-col items-center justify-center text-center shadow-sm group hover:border-emerald-200 transition-all">
                  <div className="p-4 bg-emerald-50 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <cert.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">{cert.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Standards Cards */}
          <section id="encryption" className="mb-24 scroll-mt-20">
            <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">Technical Security Standards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {securityStandards.map((std) => (
                <div key={std.title} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group">
                  <div className="p-3 bg-emerald-50 rounded-4xl w-fit mb-6 group-hover:bg-emerald-100 transition-colors">
                    <std.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">{std.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed mb-8">{std.description}</p>
                  <div className="flex flex-col gap-3">
                    {std.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-700">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Specs Table */}
          <section id="infrastructure" className="mb-24 scroll-mt-20">
            <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">Technical Specifications</h3>
            <div className="overflow-hidden border border-slate-200 rounded-4xl shadow-sm bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Parameter</th>
                    <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Protocol / Standard</th>
                    <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {technicalSpecs.map((spec) => (
                    <tr key={spec.parameter} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 text-sm font-bold text-slate-900">{spec.parameter}</td>
                      <td className="px-8 py-6 text-sm text-slate-500 font-mono tracking-tight">{spec.protocol}</td>
                      <td className="px-8 py-6 text-right">
                        <span className={cn("inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", spec.statusColor)}>
                          {spec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Whitepaper Section */}
          <section id="privacy" className="scroll-mt-20">
            <div className="bg-emerald-600 rounded-[40px] p-12 md:p-16 text-center shadow-xl shadow-emerald-600/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-transparent" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10 tracking-tight">Full Security Whitepaper</h2>
              <p className="text-emerald-50 max-w-2xl mx-auto mb-10 relative z-10 leading-relaxed text-lg">
                Download our comprehensive 45-page security dossier detailing our cloud architecture, disaster recovery plans, and organizational security policies.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <Button className="h-14 px-10 bg-white text-emerald-600 hover:bg-emerald-50 font-bold text-sm uppercase tracking-widest rounded-4xl transition-all shadow-lg hover:shadow-xl hover:scale-105">
                  <Download className="w-4 h-4 mr-3" />
                  Download PDF (2.4MB)
                </Button>
                <Button variant="outline" className="h-14 px-10 border-white/30 text-white hover:bg-white/10 font-bold text-sm uppercase tracking-widest rounded-4xl transition-all">
                  Request DPA
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

    </div>
  );
}
