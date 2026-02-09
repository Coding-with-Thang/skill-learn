"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Mail,
  MessageCircle,
  Layout,
  CreditCard,
  Cpu,
  ShieldCheck,
  Settings,
  Plus,
  Minus,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import { Input } from "@skill-learn/ui/components/input";
import { Button } from "@skill-learn/ui/components/button";
import { Card } from "@skill-learn/ui/components/card";
import { cn } from "@skill-learn/lib/utils.js";

const faqData = [
  {
    category: "Platform Features",
    icon: Cpu,
    id: "platform-features",
    questions: [
      {
        q: "How do I create my first course?",
        a: "To create your first course, navigate to the 'Instructor Dashboard' and click on the '+ New Course' button. You can then use our drag-and-drop builder to add modules, quizzes, and multimedia content. Detailed tutorials are available in our 'Learning Center' category."
      },
      {
        q: "Can I white-label the student interface?",
        a: "Yes! Skill-Learn offers extensive white-labeling options for Enterprise customers. You can customize the domain, brand colors, logo, and even the email templates sent to your students."
      },
      {
        q: "What file types are supported for uploads?",
        a: "We support a wide range of file types including MP4 for videos, PDF for documents, ZIP for SCORM packages, and all major image formats (JPG, PNG, SVG). Maximum file size depends on your subscription plan."
      }
    ]
  },
  {
    category: "Billing & Plans",
    icon: CreditCard,
    id: "billing-plans",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for larger enterprise accounts. For annual billing, we also support invoicing with Net-30 terms."
      },
      {
        q: "Can I change my plan at any time?",
        a: "Absolutely! You can upgrade or downgrade your plan at any time from your billing settings. Upgrades take effect immediately on a prorated basis, while downgrades take effect at the start of your next billing cycle."
      }
    ]
  },
  {
    category: "Technical Support",
    icon: Settings,
    id: "technical-support",
    questions: [
      {
        q: "Does Skill-Learn offer SSO?",
        a: "Yes, we support Single Sign-On (SSO) via SAML 2.0, Okta, and Microsoft Azure AD for Enterprise plans. This allows your team to log in using their existing corporate credentials securely."
      }
    ]
  }
];

const categories = [
  { id: "general", label: "General", icon: HelpCircle },
  { id: "billing-plans", label: "Billing & Plans", icon: CreditCard },
  { id: "platform-features", label: "Platform Features", icon: Cpu },
  { id: "technical-support", label: "Technical Support", icon: Settings },
  { id: "security-privacy", label: "Security & Privacy", icon: ShieldCheck },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("platform-features");
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFaqs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(faq =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans pb-24">
      {/* Breadcrumbs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ol className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <li><Link href="/" className="hover:text-brand-teal transition-colors">Home</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li><Link href="/support" className="hover:text-brand-teal transition-colors">Support</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li className="text-slate-600">FAQ Hub</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1B1B53] rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden"
        >
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-teal/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-brand-teal font-extrabold text-white mb-6 tracking-tight">
              How can we help you today?
            </h1>
            <p className="text-brand-teal text-lg font-medium mb-12">
              Search our knowledge base for answers to common questions about the Skill-Learn platform.
            </p>

            <div className="relative max-w-2xl mx-auto group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-teal transition-colors" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers (e.g., 'API integration', 'Invoices')..."
                className="h-16 pl-14 pr-6 rounded-4xl bg-white border-none shadow-xl focus:ring-2 focus:ring-brand-teal/20 text-lg transition-all"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 sticky top-24">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-4">Categories</h3>
              <nav className="space-y-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-4 rounded-4xl font-bold transition-all text-left",
                        activeCategory === cat.id
                          ? "bg-brand-teal/10 text-brand-teal"
                          : "text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-sm">{cat.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-12 p-6 bg-slate-50 rounded-4xl">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">STILL NEED HELP?</h4>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Can't find what you're looking for? Our team is here to help.
                </p>
                <Button className="w-full bg-[#00D181] hover:bg-[#00B871] text-brand-dark-blue font-bold rounded-xl h-11">
                  Contact Support
                </Button>
              </div>
            </div>
          </aside>

          {/* FAQ Content */}
          <div className="lg:col-span-9 space-y-12">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <HelpCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-500">We couldn't find any questions matching "{searchQuery}". Try a different search term or browse our categories.</p>
              </div>
            ) : (
              filteredFaqs.map((section) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                    id={section.id}
                  >
                    <div className="flex items-center gap-3 px-4">
                      <Icon className="w-5 h-5 text-brand-teal" />
                      <h2 className="text-xl font-extrabold text-[#1B1B53]">{section.category}</h2>
                    </div>

                    <div className="space-y-4">
                      {section.questions.map((faq, idx) => {
                        const id = `${section.id}-${idx}`;
                        const isExpanded = expandedItems[id];
                        return (
                          <div
                            key={id}
                            className={cn(
                              "bg-white rounded-4xl border transition-all duration-300",
                              isExpanded ? "border-brand-teal shadow-md" : "border-slate-100 hover:border-slate-200"
                            )}
                          >
                            <button
                              onClick={() => toggleExpand(id)}
                              className="w-full flex items-center justify-between p-6 text-left group"
                            >
                              <span className={cn(
                                "text-base font-bold transition-colors",
                                isExpanded ? "text-brand-teal" : "text-slate-900 group-hover:text-brand-teal"
                              )}>
                                {faq.q}
                              </span>
                              <div className={cn(
                                "p-2 rounded-lg transition-colors",
                                isExpanded ? "bg-brand-teal/10 text-brand-teal" : "text-slate-400 group-hover:bg-slate-50"
                              )}>
                                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                              </div>
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-6 pt-0 border-t border-slate-50 text-slate-600 leading-relaxed text-sm">
                                    {faq.a}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-white rounded-[40px] p-12 md:p-16 border border-slate-100 shadow-sm text-center">
          <h2 className="text-3xl font-extrabold text-[#1B1B53] mb-4 tracking-tight">Can't find the answer?</h2>
          <p className="text-slate-500 mb-12 max-w-xl mx-auto font-medium">
            Our support experts are available 24/7 to help you with any questions or technical issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="h-14 px-8 bg-[#00D181] hover:bg-[#00B871] text-brand-dark-blue font-black rounded-4xl flex items-center gap-3 shadow-lg shadow-emerald-500/10">
              <Mail className="w-5 h-5" />
              Email Support
            </Button>
            <Button variant="outline" className="h-14 px-8 border-slate-100 text-[#1B1B53] font-bold rounded-4xl flex items-center gap-3 hover:bg-slate-50">
              <MessageCircle className="w-5 h-5" />
              Live Chat
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
