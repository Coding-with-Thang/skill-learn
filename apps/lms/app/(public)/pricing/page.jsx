"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Zap,
  Building2,
  Rocket,
  Users,
  BookOpen,
  Trophy,
  BarChart3,
  Shield,
  Headphones,
  Sparkles,
  Gift,
  Clock,
  Globe,
  Lock,
  MessageSquare,
  FileText,
  Award,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";
import { cn } from "@skill-learn/lib/utils.js";
import Link from "next/link";

// Pricing tiers data
const pricingTiers = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for small teams getting started with learning management",
    price: { monthly: 0, annually: 0 },
    icon: Zap,
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    users: "Up to 10 users",
    storage: "1 GB storage",
    features: [
      { name: "Up to 10 users", included: true },
      { name: "5 courses", included: true },
      { name: "Basic quizzes", included: true },
      { name: "Point system", included: true },
      { name: "Basic leaderboard", included: true },
      { name: "Community support", included: true },
      { name: "Standard analytics", included: false },
      { name: "Custom branding", included: false },
      { name: "API access", included: false },
      { name: "SSO integration", included: false },
      { name: "Priority support", included: false },
      { name: "Advanced security", included: false },
    ],
    cta: "Start Free",
    ctaVariant: "outline",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing organizations that need more power and flexibility",
    price: { monthly: 29, annually: 24 },
    icon: Rocket,
    color: "from-brand-teal to-blue-600",
    bgColor: "bg-brand-teal/5",
    borderColor: "border-brand-teal",
    users: "Up to 100 users",
    storage: "25 GB storage",
    features: [
      { name: "Up to 100 users", included: true },
      { name: "Unlimited courses", included: true },
      { name: "Advanced quizzes", included: true },
      { name: "Gamification suite", included: true },
      { name: "Full leaderboard", included: true },
      { name: "Email support", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Custom branding", included: true },
      { name: "API access", included: true },
      { name: "SSO integration", included: false },
      { name: "Priority support", included: false },
      { name: "Advanced security", included: false },
    ],
    cta: "Start 14-Day Trial",
    ctaVariant: "default",
    popular: true,
    badge: "Most Popular",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations requiring enterprise-grade features",
    price: { monthly: "Custom", annually: "Custom" },
    icon: Building2,
    color: "from-purple-600 to-indigo-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    users: "Unlimited users",
    storage: "Unlimited storage",
    features: [
      { name: "Unlimited users", included: true },
      { name: "Unlimited courses", included: true },
      { name: "Advanced quizzes", included: true },
      { name: "Full gamification", included: true },
      { name: "Custom leaderboards", included: true },
      { name: "24/7 phone support", included: true },
      { name: "Enterprise analytics", included: true },
      { name: "White-label solution", included: true },
      { name: "Full API access", included: true },
      { name: "SSO/SAML/SCIM", included: true },
      { name: "Dedicated CSM", included: true },
      { name: "SOC 2 compliance", included: true },
    ],
    cta: "Contact Sales",
    ctaVariant: "outline",
    popular: false,
  },
];

// Feature comparison data
const featureCategories = [
  {
    name: "Users & Content",
    icon: Users,
    features: [
      { name: "Team members", free: "10", pro: "100", enterprise: "Unlimited" },
      { name: "Courses", free: "5", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "Storage", free: "1 GB", pro: "25 GB", enterprise: "Unlimited" },
      { name: "File uploads", free: "100 MB/file", pro: "500 MB/file", enterprise: "No limit" },
    ],
  },
  {
    name: "Learning Features",
    icon: BookOpen,
    features: [
      { name: "Quizzes & assessments", free: "Basic", pro: "Advanced", enterprise: "Advanced" },
      { name: "Course certificates", free: false, pro: true, enterprise: true },
      { name: "Learning paths", free: false, pro: true, enterprise: true },
      { name: "SCORM support", free: false, pro: true, enterprise: true },
    ],
  },
  {
    name: "Gamification",
    icon: Trophy,
    features: [
      { name: "Points system", free: true, pro: true, enterprise: true },
      { name: "Leaderboards", free: "Basic", pro: "Full", enterprise: "Custom" },
      { name: "Badges & achievements", free: false, pro: true, enterprise: true },
      { name: "Rewards store", free: false, pro: true, enterprise: true },
      { name: "Games & activities", free: false, pro: true, enterprise: true },
    ],
  },
  {
    name: "Analytics & Reports",
    icon: BarChart3,
    features: [
      { name: "Basic reports", free: true, pro: true, enterprise: true },
      { name: "Advanced analytics", free: false, pro: true, enterprise: true },
      { name: "Custom dashboards", free: false, pro: false, enterprise: true },
      { name: "Data export", free: "CSV", pro: "CSV, Excel", enterprise: "All formats" },
      { name: "API reporting", free: false, pro: true, enterprise: true },
    ],
  },
  {
    name: "Administration",
    icon: Shield,
    features: [
      { name: "Role management", free: "Basic", pro: "Custom", enterprise: "Advanced" },
      { name: "Feature controls", free: false, pro: true, enterprise: true },
      { name: "Audit logs", free: false, pro: true, enterprise: true },
      { name: "Bulk operations", free: false, pro: true, enterprise: true },
    ],
  },
  {
    name: "Security & Compliance",
    icon: Lock,
    features: [
      { name: "SSL encryption", free: true, pro: true, enterprise: true },
      { name: "SSO integration", free: false, pro: false, enterprise: true },
      { name: "SAML/SCIM", free: false, pro: false, enterprise: true },
      { name: "SOC 2 Type II", free: false, pro: false, enterprise: true },
      { name: "Data residency", free: false, pro: false, enterprise: true },
    ],
  },
  {
    name: "Support",
    icon: Headphones,
    features: [
      { name: "Community support", free: true, pro: true, enterprise: true },
      { name: "Email support", free: false, pro: true, enterprise: true },
      { name: "Priority support", free: false, pro: false, enterprise: true },
      { name: "Phone support", free: false, pro: false, enterprise: true },
      { name: "Dedicated CSM", free: false, pro: false, enterprise: true },
      { name: "SLA guarantee", free: false, pro: false, enterprise: true },
    ],
  },
];

// FAQ data
const faqs = [
  {
    question: "Can I try before I buy?",
    answer: "Yes! Our Pro plan comes with a 14-day free trial. No credit card required. You can also start with our Free plan and upgrade anytime.",
  },
  {
    question: "What happens when I exceed my user limit?",
    answer: "We'll notify you when you're approaching your limit. You can upgrade your plan at any time to accommodate more users. We won't lock you out suddenly.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Absolutely! You can upgrade or downgrade your plan at any time. When upgrading, you'll have immediate access to new features. When downgrading, changes take effect at your next billing cycle.",
  },
  {
    question: "Is there a discount for annual billing?",
    answer: "Yes! When you choose annual billing, you save approximately 17% compared to monthly billing. That's like getting 2 months free!",
  },
  {
    question: "Do you offer discounts for non-profits or education?",
    answer: "Yes, we offer special pricing for non-profit organizations and educational institutions. Contact our sales team to learn more about our discount programs.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and for Enterprise customers, we also support invoicing and wire transfers.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period. We don't believe in lock-in contracts.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption, regular security audits, and comply with GDPR. Enterprise plans include additional security features like SSO and SOC 2 compliance.",
  },
];

// Pricing card component
function PricingCard({ tier, isAnnual }) {
  const Icon = tier.icon;
  const price = isAnnual ? tier.price.annually : tier.price.monthly;
  const isCustom = price === "Custom";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative flex flex-col rounded-2xl border-2 p-8 h-full",
        tier.popular
          ? "border-brand-teal shadow-2xl shadow-brand-teal/20 scale-105 z-10"
          : tier.borderColor,
        tier.bgColor
      )}
    >
      {/* Popular badge */}
      {tier.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className={cn(
            "inline-flex items-center gap-1 px-4 py-1 rounded-full text-sm font-semibold text-white",
            "bg-gradient-to-r", tier.color
          )}>
            <Sparkles className="w-4 h-4" />
            {tier.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className={cn(
          "inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4",
          "bg-gradient-to-br", tier.color
        )}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
        <p className="text-gray-600 text-sm">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6 pb-6 border-b border-gray-200">
        {isCustom ? (
          <div className="text-4xl font-bold text-gray-900">Custom</div>
        ) : (
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold text-gray-900">${price}</span>
            <span className="text-gray-600">/user/month</span>
          </div>
        )}
        {!isCustom && isAnnual && (
          <p className="text-sm text-green-600 mt-2">
            Save ${(tier.price.monthly - tier.price.annually) * 12}/year
          </p>
        )}
        <p className="text-sm text-gray-500 mt-2">{tier.users}</p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-grow">
        {tier.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
            )}
            <span className={cn(
              "text-sm",
              feature.included ? "text-gray-700" : "text-gray-400"
            )}>
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        className={cn(
          "w-full py-6 text-lg font-semibold",
          tier.popular
            ? "bg-gradient-to-r from-brand-teal to-blue-600 hover:from-brand-teal/90 hover:to-blue-600/90 text-white"
            : tier.ctaVariant === "outline"
              ? "border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-900"
              : ""
        )}
        variant={tier.popular ? "default" : tier.ctaVariant}
      >
        {tier.cta}
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );
}

// Feature comparison table
function FeatureComparison() {
  const [expandedCategories, setExpandedCategories] = useState(new Set(["Users & Content"]));

  const toggleCategory = (name) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const renderValue = (value) => {
    if (value === true) return <Check className="w-5 h-5 text-green-500 mx-auto" />;
    if (value === false) return <X className="w-5 h-5 text-gray-300 mx-auto" />;
    return <span className="text-sm font-medium text-gray-700">{value}</span>;
  };

  return (
    <div className="mt-20">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
        Compare All Features
      </h2>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Not sure which plan is right for you? Compare all features side by side.
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4 mb-4 sticky top-0 bg-white z-10 py-4">
            <div className="font-semibold text-gray-900">Features</div>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <Zap className="w-4 h-4" />
                Free
              </span>
            </div>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-teal/10 text-brand-teal rounded-lg font-semibold">
                <Rocket className="w-4 h-4" />
                Pro
              </span>
            </div>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
                <Building2 className="w-4 h-4" />
                Enterprise
              </span>
            </div>
          </div>

          {/* Categories */}
          {featureCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategories.has(category.name);

            return (
              <div key={category.name} className="mb-2">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full grid grid-cols-4 gap-4 items-center py-4 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">{category.name}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-gray-400 transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  </div>
                  <div />
                  <div />
                  <div />
                </button>

                {/* Features */}
                {isExpanded && (
                  <div className="border-l-2 border-gray-100 ml-6 mt-2 space-y-1">
                    {category.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-4 gap-4 items-center py-3 px-4 hover:bg-gray-50 rounded-r-lg"
                      >
                        <div className="text-sm text-gray-600 pl-4">{feature.name}</div>
                        <div className="text-center">{renderValue(feature.free)}</div>
                        <div className="text-center">{renderValue(feature.pro)}</div>
                        <div className="text-center">{renderValue(feature.enterprise)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// FAQ section
function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="mt-20">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
        Frequently Asked Questions
      </h2>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Got questions? We&apos;ve got answers. If you can&apos;t find what you&apos;re looking for, feel free to contact us.
      </p>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
              <ChevronDown className={cn(
                "w-5 h-5 text-gray-400 flex-shrink-0 transition-transform",
                openIndex === idx && "rotate-180"
              )} />
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-6 text-gray-600">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main pricing page
export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-teal/10 text-brand-teal rounded-full text-sm font-semibold mb-6">
              <Gift className="w-4 h-4" />
              14-day free trial on Pro plan
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Choose the perfect plan for your organization. Start free, upgrade when you need more.
              No hidden fees, no surprises.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-4 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "px-6 py-3 rounded-lg text-sm font-semibold transition-all",
                  !isAnnual
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "px-6 py-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                  isAnnual
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Annual
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {pricingTiers.map((tier, idx) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                isAnnual={isAnnual}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            <div className="flex flex-col items-center gap-2 text-center">
              <Shield className="w-8 h-8 text-brand-teal" />
              <span className="text-sm font-semibold text-gray-900">SSL Encrypted</span>
              <span className="text-xs text-gray-500">256-bit encryption</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Clock className="w-8 h-8 text-brand-teal" />
              <span className="text-sm font-semibold text-gray-900">99.9% Uptime</span>
              <span className="text-xs text-gray-500">Guaranteed SLA</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Globe className="w-8 h-8 text-brand-teal" />
              <span className="text-sm font-semibold text-gray-900">GDPR Compliant</span>
              <span className="text-xs text-gray-500">Data protection</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Headphones className="w-8 h-8 text-brand-teal" />
              <span className="text-sm font-semibold text-gray-900">24/7 Support</span>
              <span className="text-xs text-gray-500">Enterprise plans</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureComparison />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-teal to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Training?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of organizations using Skill-Learn to engage, train, and grow their teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-brand-teal hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Talk to Sales
              </Button>
            </div>
            <p className="text-white/70 text-sm mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer note */}
      <section className="py-8 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">
          All prices are in USD. Taxes may apply based on your location.
        </p>
      </section>
    </main>
  );
}
