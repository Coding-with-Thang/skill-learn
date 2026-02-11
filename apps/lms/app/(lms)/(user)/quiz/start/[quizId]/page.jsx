"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@skill-learn/lib/utils/axios.js";
import { useQuizStartStore } from "@skill-learn/lib/stores/quizStore.js";
import { Button } from "@skill-learn/ui/components/button";
import {
  Play,
  Trophy,
  Clock,
  BarChart2,
  CheckCircle2,
  HelpCircle,
  RotateCw,
  Check,
} from "lucide-react";
import { Loader } from "@skill-learn/ui/components/loader";
import BreadCrumbCom from "@/components/shared/BreadCrumb";

export default function SelectedQuizPage() {
  const router = useRouter();
  const { selectedQuiz } = useQuizStartStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const startQuiz = async () => {
    if (!selectedQuiz?.id || !selectedQuiz?.categoryId) {
      console.error("Invalid quiz data:", selectedQuiz);
      alert("Invalid quiz data. Please try selecting the quiz again.");
      router.push("/training");
      return;
    }

    if (
      !selectedQuiz.questions ||
      !Array.isArray(selectedQuiz.questions) ||
      selectedQuiz.questions.length === 0
    ) {
      console.error("Quiz has no questions:", selectedQuiz);
      alert("This quiz has no questions available. Please contact an administrator.");
      return;
    }

    try {
      await api.post("/user/quiz/start", {
        categoryId: selectedQuiz.categoryId,
        quizId: selectedQuiz.id,
      });
      sessionStorage.removeItem("quizProgress");
      router.push("/quiz");
    } catch (error) {
      console.error("Error starting quiz: ", error);
      if (error.response?.status === 401) {
        router.push("/sign-in");
      } else {
        alert("Failed to start quiz. Please try again.");
      }
    }
  };

  const handleQuizNavigation = async () => {
    if (!selectedQuiz?.questions?.length) return;
    await startQuiz();
  };

  useEffect(() => {
    const fetchQuizStats = async () => {
      if (!selectedQuiz?.categoryId) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get(`/user/quiz/stats/${selectedQuiz.categoryId}`);
        const statsData = response.data?.data || response.data;
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching quiz stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!selectedQuiz) {
      router.push("/training");
      return;
    }
    if (!selectedQuiz.categoryId) {
      router.push("/training");
      return;
    }
    if (
      !selectedQuiz.questions ||
      !Array.isArray(selectedQuiz.questions) ||
      selectedQuiz.questions.length === 0
    ) {
      alert("This quiz has no questions available. Redirecting to training page.");
      router.push("/training");
      return;
    }
    fetchQuizStats();
  }, [selectedQuiz, router]);

  if (isLoading) return <Loader variant="gif" />;

  const questionCount = selectedQuiz?.questions?.length ?? 0;
  const attempts = stats?.attempts ?? 0;
  const completed = stats?.completed ?? 0;
  const bestScore = stats?.bestScore;
  const averageScore = stats?.averageScore;
  const passingScore = selectedQuiz?.passingScore ?? 80;
  const timeLimit = selectedQuiz?.timeLimit;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 md:px-12 py-8">
      {/* Breadcrumb row - muted, small, above main card */}
      <div className="text-sm text-muted-foreground mb-6 [&_*]:text-inherit [&_*]:text-sm">
        <BreadCrumbCom
          crumbs={[{ name: "Training", href: "/training" }]}
          endtrail={selectedQuiz?.title}
        />
      </div>

      {/* Main centered card */}
      <div className="rounded-2xl border border-border bg-card shadow-theme-lg p-8 sm:p-10">
        {/* Header section */}
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {selectedQuiz?.title}
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
            {selectedQuiz?.description ||
              "Master the art of communication, leadership, and emotional intelligence. This assessment will help you identify your strengths and areas for growth."}
          </p>
        </header>

        {/* Stats cards - 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 p-4 flex flex-col items-center text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 mb-2">
              <Trophy className="h-5 w-5" />
            </span>
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
              BEST SCORE
            </span>
            <span className="text-lg font-bold text-foreground">
              {bestScore != null ? `${Number(bestScore).toFixed(1)}%` : "—"}
            </span>
          </div>

          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-4 flex flex-col items-center text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-2">
              <BarChart2 className="h-5 w-5" />
            </span>
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
              AVERAGE
            </span>
            <span className="text-lg font-bold text-foreground">
              {averageScore != null ? `${Number(averageScore).toFixed(1)}%` : "—"}
            </span>
          </div>

          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-4 flex flex-col items-center text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
              PASSING
            </span>
            <span className="text-lg font-bold text-foreground">{passingScore}%</span>
          </div>

          <div className="rounded-xl bg-muted/60 p-4 flex flex-col items-center text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
              <Clock className="h-5 w-5" />
            </span>
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
              TIME LIMIT
            </span>
            <span className="text-lg font-bold text-foreground">
              {timeLimit ? `${timeLimit} min` : "None"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-0 h-px bg-border mb-8" />

        {/* Quiz meta row - 3 items with vertical separators */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mb-8">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Questions</span>
            <span className="text-sm font-bold text-foreground">
              {questionCount} {questionCount === 1 ? "Question" : "Questions"}
            </span>
          </div>
          <div className="hidden sm:block w-px h-5 bg-border shrink-0" aria-hidden />
          <div className="flex items-center gap-2">
            <RotateCw className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Attempts</span>
            <span className="text-sm font-bold text-foreground">
              {attempts} Attempted
            </span>
          </div>
          <div className="hidden sm:block w-px h-5 bg-border shrink-0" aria-hidden />
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Completions</span>
            <span className="text-sm font-bold text-foreground">
              {completed} {completed === 1 ? "Completed" : "Completed"}
            </span>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col items-center text-center mb-4">
          <Button
            size="lg"
            onClick={handleQuizNavigation}
            className="px-8 py-6 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-ring-primary"
          >
            <Play className="h-5 w-5 fill-current" />
            Start Quiz
          </Button>
          <p className="mt-4 text-xs text-muted-foreground max-w-sm">
            By starting, you agree to our assessment guidelines and honor code.
          </p>
        </div>

        {/* Footer note - Verified Assessment */}
        <footer className="pt-6 border-t border-border">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 shrink-0" />
            Verified Assessment
          </p>
        </footer>
      </div>
    </div>
  );
}
