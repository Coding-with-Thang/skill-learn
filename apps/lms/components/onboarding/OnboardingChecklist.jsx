"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  User,
  BookOpen,
  UserPlus,
  HelpCircle,
  Trophy,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Progress } from "@skill-learn/ui/components/progress";
import { cn } from "@skill-learn/lib/utils.js";
import {
  useOnboardingStore,
  ONBOARDING_ITEMS,
} from "@skill-learn/lib/stores/onboardingStore.js";

const iconMap = {
  User,
  BookOpen,
  UserPlus,
  HelpCircle,
  Trophy,
};

export function OnboardingChecklist({ className }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  const {
    completedSteps,
    dismissed,
    dismissChecklist,
    showChecklist,
    isStepComplete,
    getProgress,
    getNextStep,
    getTotalPoints,
  } = useOnboardingStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const progress = getProgress();
  const nextStep = getNextStep();
  const totalPoints = getTotalPoints();

  // Don't show if dismissed or complete
  if (dismissed || progress.isComplete) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("", className)}
    >
      <Card className="border-brand-teal/20 bg-linear-to-br from-brand-teal/5 to-blue-50 dark:from-brand-teal/10 dark:to-blue-950/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-teal" />
              </div>
              <div>
                <CardTitle className="text-lg">Getting Started</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete these steps to get the most out of Skill-Learn
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={dismissChecklist}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {progress.completed} of {progress.total} completed
              </span>
              <span className="font-medium text-brand-teal">
                {totalPoints} points earned
              </span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>

          {/* Checklist Items */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {ONBOARDING_ITEMS.map((item, index) => {
                  const Icon = iconMap[item.icon] || CheckCircle2;
                  const isComplete = isStepComplete(item.id);
                  const isNext = nextStep?.id === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={item.href}>
                        <div
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-all",
                            "hover:bg-white/50 dark:hover:bg-white/5",
                            isComplete && "opacity-60",
                            isNext && "ring-2 ring-brand-teal/30 bg-white/50 dark:bg-white/5"
                          )}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                              isComplete
                                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                : isNext
                                  ? "bg-brand-teal/10 text-brand-teal"
                                  : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                            )}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "font-medium text-sm",
                                isComplete && "line-through text-muted-foreground"
                              )}
                            >
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={cn(
                                "text-xs font-medium px-2 py-0.5 rounded-full",
                                isComplete
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              )}
                            >
                              +{item.points} pts
                            </span>
                            {isNext && (
                              <ArrowRight className="w-4 h-4 text-brand-teal" />
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Action */}
          {nextStep && !isExpanded && (
            <Link href={nextStep.href}>
              <Button variant="outline" className="w-full mt-2" size="sm">
                <ArrowRight className="w-4 h-4 mr-2" />
                {nextStep.title}
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Compact version for sidebar
 */
export function OnboardingChecklistCompact({ className }) {
  const [mounted, setMounted] = useState(false);
  const { dismissed, getProgress, getNextStep, isStepComplete } = useOnboardingStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const progress = getProgress();
  const nextStep = getNextStep();

  if (dismissed || progress.isComplete) {
    return null;
  }

  return (
    <Link href={nextStep?.href || "/dashboard"}>
      <div
        className={cn(
          "p-3 rounded-lg bg-brand-teal/5 hover:bg-brand-teal/10 transition-colors cursor-pointer",
          className
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-brand-teal" />
          <span className="text-sm font-medium">Getting Started</span>
        </div>
        <Progress value={progress.percentage} className="h-1.5 mb-2" />
        <p className="text-xs text-muted-foreground">
          {progress.completed}/{progress.total} complete
        </p>
      </div>
    </Link>
  );
}

export default OnboardingChecklist;
