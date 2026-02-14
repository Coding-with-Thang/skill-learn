"use client";

import Link from "next/link";
import { Card } from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Trophy, RotateCw, Sparkles, CheckCircle2, Target, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@skill-learn/lib/utils";

type StudyStats = { studied?: number; correct?: number; uniqueShown?: number };

export default function StudyResultsView({
  stats = {},
  deckName = "Session",
  streak = 0,
  onReview,
}: {
  stats?: StudyStats;
  deckName?: string;
  streak?: number;
  onReview?: () => void;
}) {
  const { studied = 0, correct = 0, uniqueShown } = stats;
  const cardsStudied = uniqueShown ?? studied;
  const accuracy = studied > 0 ? Math.round((correct / studied) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-amber-500/10 blur-[130px] rounded-full animate-pulse-subtle" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-cyan-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="max-w-2xl mx-auto w-full px-6 py-12 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              SESSION COMPLETE
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Great work!</h1>
          <p className="text-muted-foreground">
            You studied <span className="font-semibold text-foreground">{deckName}</span>
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="p-6 rounded-4xl border-border bg-card/80 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{cardsStudied}</p>
                <p className="text-sm text-muted-foreground">Cards Studied</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-4xl border-border bg-card/80 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500/10">
                <Target className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-4xl border-border bg-card/80 backdrop-blur col-span-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{streak} Days</p>
                <p className="text-sm text-muted-foreground">Active Streak</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/flashcards" className="flex-1">
            <Button
              size="lg"
              className="w-full h-14 rounded-4xl text-base font-bold bg-linear-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Finish & Return
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={onReview}
            className="flex-1 h-14 rounded-4xl text-base font-bold"
          >
            <RotateCw className="w-5 h-5 mr-2" />
            Review Session
          </Button>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground">
          Keep your streak going by studying again soon.
        </p>
      </div>
    </div>
  );
}
