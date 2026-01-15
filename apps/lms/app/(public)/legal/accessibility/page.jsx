"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  CheckCircle2,
  Cpu,
  Terminal,
  MessageSquare,
  ChevronRight,
  Mail,
  Phone,
  AlertCircle,
  Globe,
  Monitor,
  Layout,
  Code2,
  Flag,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@skill-learn/ui/components/button";
import { cn } from "@skill-learn/lib/utils.js";

const sections = [
  { id: "commitment", name: "Our Commitment", icon: Heart },
  { id: "conformance", name: "Conformance Status", icon: CheckCircle2 },
  { id: "compatibility", name: "Compatibility", icon: Layout },
  { id: "technical-specs", name: "Technical Specs", icon: Code2 },
  { id: "feedback", name: "Feedback Mechanism", icon: MessageSquare },
];

export default function AccessibilityPage() {
  const [activeSection, setActiveSection] = useState("commitment");

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
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-slate-900">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-100 pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <span className="hover:text-brand-teal cursor-pointer">Legal</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">Accessibility Statement</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Accessibility Statement
            </h1>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold uppercase tracking-wider">
              WCAG 2.1 AA
            </div>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
            Our commitment to providing an inclusive and barrier-free learning experience for every student and professional using the Skill-Learn platform.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-10">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">Table of Contents</h3>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Quick Navigation</p>
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
                            ? "bg-emerald-50 text-emerald-600"
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
            </div>
          </aside>

          {/* Policy Text */}
          <div className="flex-1 max-w-4xl">
            <div className="space-y-16">
              {/* Our Commitment */}
              <section id="commitment" className="scroll-mt-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Our Commitment</h2>
                </div>
                <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed space-y-6">
                  <p>
                    Skill-Learn is dedicated to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to our Learning Management System.
                  </p>
                  <p>
                    As an educational platform, we believe that learning should be equitable. Our design system follows high-contrast guidelines, consistent navigation structures, and keyboard-friendly interactions to support diverse learning needs.
                  </p>
                </div>
              </section>

              {/* Conformance Status */}
              <section id="conformance" className="scroll-mt-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Conformance Status</h2>
                </div>
                <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed space-y-6">
                  <p>
                    The <span className="font-bold text-slate-900">Web Content Accessibility Guidelines (WCAG)</span> defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.
                  </p>
                  <p>
                    Skill-Learn is partially conformant with <span className="text-emerald-600 font-bold">WCAG 2.1 level AA</span>. Partially conformant means that some parts of the content do not fully conform to the accessibility standard, and we are working tirelessly to address these areas through our quarterly accessibility audits.
                  </p>
                </div>
              </section>

              {/* Compatibility */}
              <section id="compatibility" className="scroll-mt-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Compatibility</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                    <div className="p-3 bg-emerald-50 rounded-xl w-fit mb-6">
                      <Monitor className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Assistive Technologies</h4>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                      Skill-Learn is designed to be compatible with common screen readers including:
                    </p>
                    <ul className="space-y-3">
                      {["JAWS", "NVDA", "VoiceOver (macOS and iOS)"].map((tech) => (
                        <li key={tech} className="flex items-start gap-3">
                          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span className="text-sm text-slate-700 font-medium">{tech}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                    <div className="p-3 bg-emerald-50 rounded-xl w-fit mb-6">
                      <Globe className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Supported Browsers</h4>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                      For the best experience, we recommend using the latest versions of:
                    </p>
                    <ul className="space-y-3">
                      {["Google Chrome", "Mozilla Firefox", "Apple Safari", "Microsoft Edge"].map((browser) => (
                        <li key={browser} className="flex items-start gap-3">
                          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span className="text-sm text-slate-700 font-medium">{browser}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Technical Specifications */}
              <section id="technical-specs" className="scroll-mt-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Technical Specifications</h2>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  Accessibility of Skill-Learn relies on the following technologies to work with the particular combination of web browser and any assistive technologies or plugins installed on your computer:
                </p>
                <div className="flex flex-wrap gap-3">
                  {["HTML5", "WAI-ARIA", "CSS3", "JavaScript"].map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold uppercase tracking-wide border border-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </section>

              {/* Feedback Mechanism */}
              <section id="feedback" className="scroll-mt-20">
                <div className="bg-emerald-50 rounded-3xl p-8 md:p-12 border border-emerald-100 shadow-sm relative overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Feedback & Contact</h2>
                      <p className="text-slate-600 text-lg leading-relaxed mb-8">
                        We welcome your feedback on the accessibility of Skill-Learn. Please let us know if you encounter accessibility barriers or have suggestions for improvement. We aim to respond to feedback within <span className="font-bold text-slate-900">2 business days</span>.
                      </p>

                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm">
                            <Mail className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Email</span>
                            <a href="mailto:accessibility@skill-learn.com" className="text-emerald-600 font-bold text-lg hover:underline transition-all leading-tight">
                              accessibility@skill-learn.com
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm">
                            <Phone className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Phone</span>
                            <a href="tel:+15551234567" className="text-slate-900 font-bold text-lg hover:underline transition-all leading-tight">
                              +1 (555) 123-4567
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:pl-12">
                      <button className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200 group">
                        <Flag className="w-5 h-5 group-hover:animate-bounce" />
                        Report a Barrier
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200/60 mt-12">
        <p className="text-sm italic text-slate-500 text-center md:text-left">
          This statement was last updated on October 24, 2023. It was reviewed and approved by the Skill-Learn Compliance & Diversity Board.
        </p>
      </footer>
    </div>
  );
}
