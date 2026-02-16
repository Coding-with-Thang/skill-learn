"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  CheckCircle2, 
  ArrowRight, 
  Loader2,
  Sparkles,
  BookOpen,
  Users,
  Upload,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";
import { Card, CardContent } from "@skill-learn/ui/components/card";
import { Link } from "@/i18n/navigation";

export default function OnboardingCompletePage() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();
  const [countdown, setCountdown] = useState(5);
  
  const quickStartItems = [
    {
      icon: BookOpen,
      title: t("createYourFirstCourse"),
      description: t("setUpCourseTeam"),
      href: "/dashboard/courses/create",
    },
    {
      icon: Users,
      title: t("inviteTeamMembers"),
      description: t("addLearnersWorkspace"),
      href: "/dashboard/users",
    },
    {
      icon: Upload,
      title: t("uploadLearningContent"),
      description: t("addVideosDocumentsQuizzes"),
      href: "/dashboard/quizzes",
    },
  ];

  // Trigger confetti on mount
  useEffect(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Countdown to dashboard redirect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/onboarding/account");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-teal mx-auto" />
            <p className="text-gray-600 mt-4">{t("loading")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Success Card */}
      <Card className="mb-8">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles className="w-12 h-12 text-green-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 mb-3"
          >
            {t("youreAllSet")} 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 mb-6"
          >
            {t("welcomeToSkillLearn", { name: user?.firstName || "there" })}
          </motion.p>

          {/* Completion Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[t("payment"), t("account"), t("workspaceStep")].map((step, idx) => (
              <div key={step} className="flex items-center gap-2">
                {idx > 0 && <div className="w-8 h-px bg-green-500" />}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    ✓
                  </div>
                  <span className="text-sm font-medium text-green-600">{step}</span>
                </div>
              </div>
            ))}
          </div>

          <Button asChild size="lg" className="min-w-[200px]">
            <Link href="/dashboard">
              <LayoutDashboard className="w-5 h-5 mr-2" />
              {t("goToDashboard")}
              {countdown > 0 && (
                <span className="ml-2 text-sm opacity-70">({countdown}s)</span>
              )}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          {t("quickStartGuide")}
        </h2>
        <div className="grid gap-4">
          {quickStartItems.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
            >
              <Link href={item.href}>
                <Card className="hover:border-brand-teal hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-brand-teal" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Help Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-sm text-center text-gray-500 mt-8"
      >
        {t("needHelpGettingStarted")}{" "}
        <a href="mailto:support@skill-learn.com" className="text-brand-teal hover:underline">
          {t("contactSupportTeam")}
        </a>{" "}
        {t("orCheckDocumentation")}{" "}
        <Link href="/docs" className="text-brand-teal hover:underline">
          documentation
        </Link>
        .
      </motion.p>
    </div>
  );
}
