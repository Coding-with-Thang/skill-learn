"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import { useUser } from "@clerk/nextjs";
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
  Loader2,
} from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";
import { cn } from "@skill-learn/lib/utils";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";

// Pricing tiers data
const pricingTiers = [
  {
    id: "free",
    name: "Free",
    nameKey: "free",
    descKey: "forSmallTeams",
    ctaKey: "startFree",
    description: "Perfect for small teams getting started with learning management",
    price: { monthly: 0, annually: 0 },
    icon: Zap,
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    users: "Up to 5 users",
    storage: "1 GB storage",
    features: [
      { name: "Up to 5 users", included: true },
      { name: "5 courses", included: true },
      { name: "Basic quizzes", included: true },
      { name: "Point system", included: true },
      { name: "Basic leaderboard", included: true },
      { name: "Email support", included: true },
      { name: "Standard analytics", included: false },
      { name: "Custom branding", included: false },
      { name: "Custom branding", included: false },
      { name: "SSO integration", included: false },
      { name: "Priority support", included: false },
      { name: "Advanced security", included: false },
    ],
    cta: "Start Free",
    ctaVariant: "outline",
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    nameKey: "starter",
    descKey: "forSmallTeams",
    ctaKey: "startTrial",
    description: "Perfect for small teams getting started with learning management",
    price: { monthly: 15, annually: 12 },
    icon: Users,
    color: "from-brand-teal to-blue-600",
    bgColor: "bg-brand-teal/5",
    borderColor: "border-brand-teal",
    users: "Up to 10 users",
    storage: "10 GB storage",
    features: [
      { name: "Up to 10 users", included: true },
      { name: "Unlimited courses", included: true },
      { name: "Advanced quizzes", included: true },
      { name: "Gamification suite", included: true },
      { name: "Full leaderboard", included: true },
      { name: "Email support", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Custom branding", included: true },
      { name: "SSO integration", included: false },
      { name: "Priority support", included: false },
      { name: "Advanced security", included: false },
    ],
    cta: "Start 14-Day Trial",
    ctaVariant: "default",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    nameKey: "pro",
    descKey: "forGrowingOrgs",
    ctaKey: "startTrial",
    badgeKey: "mostPopular",
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
    nameKey: "enterprise",
    descKey: "forEnterprise",
    ctaKey: "contactSales",
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
      { name: "SSO/SAML/SCIM", included: true },
      { name: "Dedicated CSM", included: true },
      { name: "SOC 2 compliance", included: true },
    ],
    cta: "Contact Sales",
    ctaVariant: "outline",
    popular: false,
  },
];

// Feature comparison data - will be translated in component
const getFeatureCategories = (t) => [
  {
    name: "Users & Content",
    nameKey: "usersContent",
    icon: Users,
    features: [
      { name: "Team members", nameKey: "teamMembers", free: "5", starter: "10", pro: "100", enterprise: t("unlimitedUsers") },
      { name: "Courses", nameKey: "courses", free: "5", starter: t("unlimitedCourses"), pro: t("unlimitedCourses"), enterprise: t("unlimitedCourses") },
      { name: "Storage", nameKey: "storage", free: "1 GB", starter: "10 GB", pro: "25 GB", enterprise: t("unlimitedUsers") },
      { name: "File uploads", nameKey: "fileUploads", free: "100 MB/file", starter: "500 MB/file", pro: "1 GB/file", enterprise: t("unlimitedUsers") },
    ],
  },
  {
    name: "Learning Features",
    nameKey: "learningFeatures",
    icon: BookOpen,
    features: [
      { name: "Quizzes & assessments", nameKey: "quizzesAssessments", free: "Basic", starter: "Advanced", pro: "Advanced", enterprise: "Advanced" },
      { name: "Course certificates", nameKey: "courseCertificates", free: true, starter: true, pro: true, enterprise: true },
      { name: "Learning paths", nameKey: "learningPaths", free: false, starter: true, pro: true, enterprise: true },
      { name: "SCORM support", nameKey: "scormSupport", free: false, starter: true, pro: true, enterprise: true },
    ],
  },
  {
    name: "Gamification",
    nameKey: "gamification",
    icon: Trophy,
    features: [
      { name: "Points system", nameKey: "pointsSystem", free: true, starter: true, pro: true, enterprise: true },
      { name: "Leaderboards", nameKey: "leaderboards", free: "Basic", starter: "Full", pro: "Full", enterprise: "Custom" },
      { name: "Badges & achievements", nameKey: "badgesAchievements", free: false, starter: true, pro: true, enterprise: true },
      { name: "Rewards store", nameKey: "rewardsStore", free: false, starter: true, pro: true, enterprise: true },
      { name: "Games & activities", nameKey: "gamesActivities", free: false, starter: true, pro: true, enterprise: true },
    ],
  },
  {
    name: "Analytics & Reports",
    nameKey: "analyticsReports",
    icon: BarChart3,
    features: [
      { name: "Basic reports", nameKey: "basicReports", free: true, starter: true, pro: true, enterprise: true },
      { name: "Advanced analytics", nameKey: "advancedAnalytics", free: false, starter: true, pro: true, enterprise: true },
      { name: "Custom dashboards", nameKey: "customDashboards", free: false, starter: true, pro: true, enterprise: true },
      { name: "Data export", nameKey: "dataExport", free: "CSV", starter: "CSV, Excel", pro: "CSV, Excel", enterprise: "All formats" },
    ],
  },
  {
    name: "Administration",
    nameKey: "administration",
    icon: Shield,
    features: [
      { name: "Role management", nameKey: "roleManagement", free: "Custom", starter: "Custom", pro: "Custom", enterprise: "Advanced" },
      { name: "Feature controls", nameKey: "featureControls", free: true, starter: true, pro: true, enterprise: true },
      { name: "Audit logs", nameKey: "auditLogs", free: false, starter: true, pro: true, enterprise: true },
      { name: "Bulk operations", nameKey: "bulkOperations", free: false, starter: true, pro: true, enterprise: true },
    ],
  },
  {
    name: "Security & Compliance",
    nameKey: "securityCompliance",
    icon: Lock,
    features: [
      { name: "SSL encryption", nameKey: "sslEncryption", free: true, starter: true, pro: true, enterprise: true },
      { name: "SSO integration", nameKey: "ssoIntegration", free: false, starter: true, pro: true, enterprise: true },
      { name: "SAML/SCIM", nameKey: "samlScim", free: false, starter: true, pro: true, enterprise: true },
      { name: "SOC 2 Type II", nameKey: "soc2Type2", free: false, starter: true, pro: true, enterprise: true },
      { name: "Data residency", nameKey: "dataResidency", free: false, starter: true, pro: true, enterprise: true },
    ],
  },
  {
    name: "Support",
    nameKey: "support",
    icon: Headphones,
    features: [
      { name: "Email support", nameKey: "emailSupport", free: true, starter: true, pro: true, enterprise: true },
      { name: "Priority support", nameKey: "prioritySupport", free: false, starter: true, pro: true, enterprise: true },
      { name: "Phone support", nameKey: "phoneSupport", free: false, starter: true, pro: true, enterprise: true },
      { name: "Dedicated CSM", nameKey: "dedicatedCsm", free: false, starter: true, pro: true, enterprise: true },
      { name: "SLA guarantee", nameKey: "slaGuarantee", free: false, starter: true, pro: true, enterprise: true },
    ],
  },
];

// FAQ data - will be translated in component
const getFaqs = (t) => [
  {
    question: t("faq1Question"),
    answer: t("faq1Answer"),
  },
  {
    question: t("faq2Question"),
    answer: t("faq2Answer"),
  },
  {
    question: t("faq3Question"),
    answer: t("faq3Answer"),
  },
  {
    question: t("faq4Question"),
    answer: t("faq4Answer"),
  },
  {
    question: t("faq5Question"),
    answer: t("faq5Answer"),
  },
  {
    question: t("faq6Question"),
    answer: t("faq6Answer"),
  },
  {
    question: t("faq7Question"),
    answer: t("faq7Answer"),
  },
  {
    question: t("faq8Question"),
    answer: t("faq8Answer"),
  },
];

// Helper function to translate feature names
const translateFeatureName = (name, t) => {
  const featureMap = {
    "Up to 5 users": t("upTo5Users"),
    "Up to 10 users": t("upTo10Users"),
    "Up to 100 users": t("upTo100Users"),
    "Unlimited users": t("unlimitedUsers"),
    "5 courses": "5 courses",
    "Unlimited courses": t("unlimitedCourses"),
    "Basic quizzes": "Basic quizzes",
    "Advanced quizzes": "Advanced quizzes",
    "Point system": t("pointsSystem"),
    "Basic leaderboard": t("leaderboards") + " (Basic)",
    "Full leaderboard": t("leaderboards") + " (Full)",
    "Custom leaderboards": t("leaderboards") + " (Custom)",
    "Email support": t("emailSupport"),
    "24/7 phone support": t("phoneSupport"),
    "Standard analytics": t("basicReports"),
    "Advanced analytics": t("advancedAnalytics"),
    "Enterprise analytics": t("advancedAnalytics"),
    "Custom branding": "Custom branding",
    "SSO integration": t("ssoIntegration"),
    "SSO/SAML/SCIM": t("samlScim"),
    "Priority support": t("prioritySupport"),
    "Advanced security": t("advancedSecurity"),
    "Gamification suite": t("gamification"),
    "Full gamification": t("gamification"),
    "API access": "API access",
    "White-label solution": "White-label solution",
    "Dedicated CSM": t("dedicatedCsm"),
    "SOC 2 compliance": t("soc2Type2"),
  };
  return featureMap[name] || name;
};

// Pricing card component
function PricingCard({ tier, isAnnual, onSubscribe, isLoading, loadingPlan }) {
  const t = useTranslations("pricing");
  const Icon = tier.icon;
  const price = isAnnual ? tier.price.annually : tier.price.monthly;
  const isCustom = price === "Custom";
  const isLoadingThis = isLoading && loadingPlan === tier.id;
  const name = tier.nameKey ? t(tier.nameKey) : tier.name;
  const description = tier.descKey ? t(tier.descKey) : tier.description;
  const ctaLabel = tier.ctaKey ? t(tier.ctaKey) : tier.cta;
  const badgeLabel = tier.badgeKey ? t(tier.badgeKey) : tier.badge;

  const handleClick = () => {
    if (tier.id === "enterprise") {
      window.location.href = "mailto:sales@skill-learn.com?subject=Enterprise Plan Inquiry";
      return;
    }
    onSubscribe(tier.id, isAnnual ? "annually" : "monthly");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative flex flex-col rounded-4xl border-2 p-8 h-full transition-all duration-300",
        tier.popular
          ? "border-brand-teal shadow-2xl shadow-brand-teal/20 scale-105 z-10 pt-12"
          : tier.borderColor,
        tier.bgColor
      )}
    >
      {badgeLabel && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-6 py-2 rounded-full text-sm font-bold text-white shadow-lg",
            "bg-linear-to-r", tier.color
          )}>
            <Sparkles className="w-4 h-4" />
            {badgeLabel}
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className={cn(
          "inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4",
          "bg-linear-to-br", tier.color
        )}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      <div className="text-center mb-6 pb-6 border-b border-gray-200">
        {isCustom ? (
          <div className="text-4xl font-bold text-gray-900">{t("custom")}</div>
        ) : (
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-brand-teal font-bold">${price}</span>
            <span className="text-gray-600">{t("perUserMonth")}</span>
          </div>
        )}
        {!isCustom && isAnnual && (
          <p className="text-sm text-green-600 mt-2">
            {t("saveYear", { amount: (tier.price.monthly - tier.price.annually) * 12 })}
          </p>
        )}
        <p className="text-sm text-gray-500 mt-2">{tier.users}</p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 grow">
        {tier.features.map((feature, idx) => {
          const featureName = feature.nameKey ? t(feature.nameKey) : translateFeatureName(feature.name, t);
          return (
          <li key={idx} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
            )}
            <span className={cn(
              "text-sm",
              feature.included ? "text-gray-700" : "text-gray-400"
            )}>
              {featureName}
            </span>
          </li>
          );
        })}
      </ul>

      {/* CTA */}
      <Button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "w-full py-6 text-lg font-semibold",
          tier.popular
            ? "bg-linear-to-r from-brand-teal to-blue-600 hover:from-brand-teal/90 hover:to-blue-600/90 text-white"
            : tier.ctaVariant === "outline"
              ? "border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-900"
              : ""
        )}
        variant={tier.popular ? "default" : tier.ctaVariant}
      >
        {isLoadingThis ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {t("processing")}
          </>
        ) : (
          <>
            {ctaLabel}
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </motion.div>
  );
}

// Feature comparison table
function FeatureComparison() {
  const t = useTranslations("pricing");
  const featureCategories = getFeatureCategories(t);
  const [expandedCategories, setExpandedCategories] = useState(new Set([t("usersContent")]));

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
        {t("compareAllFeatures")}
      </h2>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        {t("compareDescription")}
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-5 gap-4 mb-4 sticky top-0 bg-white z-10 py-4 border-b border-gray-100">
            <div className="font-semibold text-gray-900">{t("features")}</div>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
                <Zap className="w-3.5 h-3.5" />
                {t("free")}
              </span>
            </div>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-teal/5 text-brand-teal rounded-lg font-semibold text-sm">
                <Users className="w-3.5 h-3.5" />
                {t("starter")}
              </span>
            </div>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-teal/10 text-brand-teal rounded-lg font-semibold text-sm border border-brand-teal/20">
                <Rocket className="w-3.5 h-3.5" />
                {t("pro")}
              </span>
            </div>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm">
                <Building2 className="w-3.5 h-3.5" />
                {t("enterprise")}
              </span>
            </div>
          </div>

          {/* Categories */}
          {featureCategories.map((category) => {
            const Icon = category.icon;
            const categoryName = category.nameKey ? t(category.nameKey) : category.name;
            const isExpanded = expandedCategories.has(categoryName);

            return (
              <div key={category.name} className="mb-2">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full grid grid-cols-5 gap-4 items-center py-4 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">{categoryName}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-gray-400 transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  </div>
                </button>

                {/* Features */}
                {isExpanded && (
                  <div className="border-l-2 border-gray-100 ml-6 mt-2 space-y-1">
                    {category.features.map((feature, idx) => {
                      const featureName = feature.nameKey ? t(feature.nameKey) : feature.name;
                      return (
                      <div
                        key={idx}
                        className="grid grid-cols-5 gap-4 items-center py-3 px-4 hover:bg-gray-50 rounded-4xl-lg"
                      >
                        <div className="text-sm text-gray-600 pl-4">{featureName}</div>
                        <div className="text-center">{renderValue(feature.free)}</div>
                        <div className="text-center">{renderValue(feature.starter)}</div>
                        <div className="text-center">{renderValue(feature.pro)}</div>
                        <div className="text-center">{renderValue(feature.enterprise)}</div>
                      </div>
                      );
                    })}
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
  const t = useTranslations("pricing");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = getFaqs(t);

  return (
    <div className="mt-20">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
        {t("frequentlyAskedQuestions")}
      </h2>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        {t("faqDescription")}
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
                "w-5 h-5 text-gray-400 shrink-0 transition-transform",
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
  const t = useTranslations("pricing");
  const [isAnnual, setIsAnnual] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  // Handle subscription checkout
  // Supports both authenticated users and new sign-ups (payment-first onboarding)
  const handleSubscribe = async (planId, interval) => {
    // For free plan, redirect to sign up
    if (planId === "free") {
      if (isSignedIn) {
        toast.success(t("alreadyOnPlan"));
        router.push("/dashboard");
      } else {
        router.push("/sign-up");
      }
      return;
    }

    setIsLoading(true);
    setLoadingPlan(planId);

    try {
      // Send checkout request - works for both authenticated and unauthenticated users
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          interval,
          isOnboarding: !isSignedIn, // New users go through onboarding flow
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.redirectToPortal) {
          toast.info(t("alreadyHaveSubscription"));
          // Redirect to billing portal
          const portalResponse = await fetch("/api/stripe/portal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const portalData = await portalResponse.json();
          if (portalData.url) {
            window.location.href = portalData.url;
          }
          return;
        }

        if (data.redirectToSignup) {
          router.push("/sign-up");
          return;
        }

        if (data.contactSales) {
          toast.info(t("enterpriseRequiresQuote"));
          window.location.href = "mailto:sales@skill-learn.com?subject=Enterprise Plan Inquiry";
          return;
        }

        throw new Error(data.error || t("failedToStartCheckout"));
      }

      // Redirect to Stripe checkout (or mock onboarding for development)
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : t("failedToStartCheckout"));
    } finally {
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 bg-linear-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-teal/10 text-brand-teal rounded-full text-sm font-semibold mb-6">
              <Gift className="w-4 h-4" />
              {t("freeTrialBadge")}
            </span>
            <h1 className="text-4xl md:text-brand-teal font-bold text-gray-900 mb-6">
              {t("heroTitle")}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t("heroDescription")}
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
                {t("monthly")}
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
                {t("annual")}
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  {t("save17")}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {pricingTiers.map((tier, idx) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                isAnnual={isAnnual}
                onSubscribe={handleSubscribe}
                isLoading={isLoading}
                loadingPlan={loadingPlan}
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
              <span className="text-sm font-semibold text-gray-900">{t("sslEncrypted")}</span>
              <span className="text-xs text-gray-500">{t("bitEncryption")}</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Clock className="w-8 h-8 text-brand-teal" />
              <span className="text-sm font-semibold text-gray-900">{t("uptime")}</span>
              <span className="text-xs text-gray-500">{t("guaranteedSla")}</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Globe className="w-8 h-8 text-brand-teal" />
              <span className="text-sm font-semibold text-gray-900">{t("gdprCompliant")}</span>
              <span className="text-xs text-gray-500">{t("dataProtection")}</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Headphones className="w-8 h-8 text-brand-teal" />
              <span className="text-sm font-semibold text-gray-900">{t("support247")}</span>
              <span className="text-xs text-gray-500">{t("enterprisePlans")}</span>
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
      <section className="py-20 bg-linear-to-r from-brand-teal to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {t("readyToTransform")}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t("joinThousands")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => handleSubscribe("pro", isAnnual ? "annually" : "monthly")}
                disabled={isLoading}
                className="bg-white text-brand-teal hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
              >
                {isLoading && loadingPlan === "pro" ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("processing")}
                  </>
                ) : (
                  <>
                    {t("startFreeTrial")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.href = "mailto:sales@skill-learn.com?subject=Enterprise Plan Inquiry"}
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                {t("talkToSales")}
              </Button>
            </div>
            <p className="text-white/70 text-sm mt-6">
              {t("noCreditCardRequired")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer note */}
      <section className="py-8 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">
          {t("allPricesUsd")}
        </p>
      </section>
    </main>
  );
}
