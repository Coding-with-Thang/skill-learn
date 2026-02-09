"use client"

import { useRouter } from "next/navigation"
import { useQuizStartStore } from "@skill-learn/lib/stores/quizStore.js"
import { Button } from "@skill-learn/ui/components/button"
import { RotateCcw, LayoutDashboard, Eye, Trophy, Timer, CheckCircle, XCircle, ListChecks, Calendar, Star, ArrowRight, ChevronDown, ChevronUp, Crown, PartyPopper, Coins } from 'lucide-react'
import { useEffect, useState } from "react"
import { Card, CardContent } from "@skill-learn/ui/components/card"
import { useAuditLog } from "@skill-learn/lib";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from "@skill-learn/lib/utils.js"
import { toast } from "sonner"

// Utility function to format time
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const formatDate = (date) => {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Collapsible Question Component
const QuestionItem = ({ question, index, userResponse, showCorrectAnswers }) => {
  const [isOpen, setIsOpen] = useState(true);

  // If no response found, treat as incorrect/skipped
  const isCorrect = userResponse?.isCorrect;
  // Get selected option IDs (assuming array for multi-select support, though usually single)
  const selectedOptionIds = userResponse?.selectedOptionIds || [];

  return (
    <Card className="border-0 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md bg-card border-border">
      <CardContent className="p-0">
        {/* Header - Clickable to toggle */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-6 md:p-8 flex items-start justify-between gap-4 cursor-pointer bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex gap-3 flex-1">
            <span className="text-lg font-bold text-primary bg-primary/10 w-8 h-8 flex items-center justify-center rounded-lg shrink-0">
              {index + 1}.
            </span>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground pt-0.5 leading-snug">
                {question.text}
              </h3>
              {!isOpen && (
                <p className="text-sm text-muted-foreground font-medium">Click to view details</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
              isCorrect ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/20 text-red-600 dark:text-red-400"
            )}>
              {isCorrect ? "Correct" : "Incorrect"}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Expandable Options Section */}
        {isOpen && (
          <div className="px-6 md:px-8 pb-8 pt-0 space-y-3 pl-14 animate-in slide-in-from-top-2 duration-200">
            {question.options?.map((option, optIndex) => {
              const isSelected = selectedOptionIds.includes(option.id);
              const isAnswerCorrect = option.isCorrect;

              // Styling Logic (theme-aware for dark mode)
              let containerClass = "border-border bg-card hover:bg-muted/50";
              let labelColor = "text-foreground";
              let icon = null;

              if (isSelected && isAnswerCorrect) {
                containerClass = "border-green-500/40 bg-green-500/10 dark:bg-green-500/20 ring-1 ring-green-500/30";
                labelColor = "text-green-700 dark:text-green-300 font-medium";
                icon = <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
              } else if (isSelected && !isAnswerCorrect) {
                containerClass = "border-red-500/40 bg-red-500/10 dark:bg-red-500/20 ring-1 ring-red-500/30";
                labelColor = "text-red-700 dark:text-red-300 font-medium";
                icon = <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
              } else if (!isSelected && isAnswerCorrect && showCorrectAnswers) {
                containerClass = "border-green-500/30 bg-card ring-1 ring-green-500/20";
                labelColor = "text-green-700 dark:text-green-400 font-medium";
                icon = <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 opacity-50" />;
              }

              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-all",
                    containerClass
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-6 h-6 rounded flex items-center justify-center text-xs font-bold border",
                      isSelected ? "border-transparent bg-primary/20 text-foreground" : "border-border bg-muted text-muted-foreground"
                    )}>
                      {String.fromCharCode(65 + optIndex)}
                    </div>
                    <span className={cn("text-base", labelColor)}>
                      {option.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isSelected && (
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-wide",
                        isAnswerCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        (Your Answer)
                      </span>
                    )}
                    {icon}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function ResultsPage() {
  const router = useRouter();
  const { selectedQuiz, quizResponses } = useQuizStartStore();
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const { logUserAction } = useAuditLog();

  // Admin/Operations Settings
  const showQuestionReview = selectedQuiz?.showQuestionReview ?? true;
  const showCorrectAnswers = selectedQuiz?.showCorrectAnswers ?? false;

  useEffect(() => {
    async function loadResults() {
      if (quizResponses) {
        setResults(quizResponses);
        return;
      }

      const savedResults = sessionStorage.getItem('lastQuizResults');
      if (!savedResults) {
        setError('No quiz results found');
        router.replace("/training");
        return;
      }

      try {
        const parsedResults = JSON.parse(savedResults);
        setResults(parsedResults);
      } catch (error) {
        toast.error("Failed to load quiz results");
        setError(error.message);
        router.replace("/training");
      }
    }
    loadResults();
  }, [quizResponses, router]);


  // Effect for logging
  useEffect(() => {
    if (results && selectedQuiz?.id) {
      logUserAction(
        'complete',
        'quiz',
        selectedQuiz.id,
        `Completed quiz with score: ${results.score}% (${results.hasPassed ? 'Passed' : 'Failed'})`
      ).catch(e => {
        if (process.env.NODE_ENV === "development") {
          console.error("Audit log error", e);
        }
      });
    }
  }, [results, selectedQuiz, logUserAction])

  if (error) return null;
  if (!results) return null; // Loading state could be added here

  // Data for Donut Chart
  const pieData = [
    { name: 'Correct', value: results.correctAnswers, color: '#22c55e' }, // green-500
    { name: 'Incorrect', value: results.totalQuestions - results.correctAnswers, color: '#ef4444' }, // red-500
  ];
  const chartData = results.totalQuestions > 0 ? pieData : [{ name: 'Empty', value: 1, color: '#e5e7eb' }];

  // Helper to get question text and options
  const questionsToReview = selectedQuiz?.questions || [];

  // Determine Points Icon & Style based on score
  const isPerfect = results.score === 100 || results.isPerfectScore;
  const isPassed = results.hasPassed;

  let PointsIcon = Coins;
  let pointsIconBg = "bg-primary/20 text-primary";
  let pointsCardBg = ""; // default uses card bg

  if (isPerfect) {
    PointsIcon = Crown;
    pointsIconBg = "bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-bounce";
    pointsCardBg = "bg-linear-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20";
  } else if (isPassed) {
    PointsIcon = Star;
    pointsIconBg = "bg-primary/20 text-primary";
  } else {
    PointsIcon = Coins;
    pointsIconBg = "bg-muted text-muted-foreground";
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 font-sans text-foreground">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* 1. Quiz Header */}
        <header className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>{selectedQuiz?.category?.name || "Product Knowledge"}</span>
              <span className="text-muted-foreground/60">•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate()}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              {selectedQuiz?.title || "Assessment Module"}
            </h1>
          </div>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

            {/* 1. Final Score */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-card border-border">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Final Score</span>
                  <div className="p-1.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-3xl font-extrabold text-foreground">{results.score}%</span>
              </CardContent>
            </Card>

            {/* 2. Correct Answers */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-card border-border">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Correct Answers</span>
                  <div className="p-1.5 bg-primary/20 text-primary rounded-full">
                    <ListChecks className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-foreground">{results.correctAnswers}</span>
                  <span className="text-sm text-muted-foreground font-medium">/ {results.totalQuestions}</span>
                </div>
              </CardContent>
            </Card>

            {/* 3. Status */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-card border-border">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</span>
                  <div className={cn("p-1.5 rounded-full", results.hasPassed ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/20 text-red-600 dark:text-red-400")}>
                    {results.hasPassed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                </div>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit",
                  results.hasPassed ? "bg-green-500/20 text-green-700 dark:text-green-300" : "bg-red-500/20 text-red-700 dark:text-red-300"
                )}>
                  {results.hasPassed ? "PASSED" : "FAILED"}
                </span>
              </CardContent>
            </Card>

            {/* 4. Points Scored */}
            <Card className={cn("border-0 shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-1 bg-card border-border", pointsCardBg)}>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Points Scored</span>
                  <div className={cn("p-1.5 rounded-full", pointsIconBg)}>
                    <PointsIcon className={cn("w-4 h-4", isPerfect && "animate-bounce")} />
                  </div>
                </div>
                <span className="text-3xl font-extrabold text-foreground">
                  {new Intl.NumberFormat().format(results.pointsEarned || 0)}
                </span>
              </CardContent>
            </Card>

            {/* 5. Time Taken */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-1 bg-card border-border">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time Taken</span>
                  <div className="p-1.5 bg-primary/20 text-primary rounded-full">
                    <Timer className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-3xl font-extrabold text-foreground">{formatTime(results.timeSpent)}</span>
              </CardContent>
            </Card>
          </div>
        </header>

        {/* 2. Accuracy Visualization */}
        <Card className="border-0 shadow-sm rounded-4xl overflow-hidden bg-card border-border">
          <CardContent className="p-8">
            <h3 className="text-lg font-bold text-foreground mb-6 text-center">Accuracy</h3>
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-extrabold text-foreground">{results.score}%</span>
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Correct</span>
                </div>
              </div>

              <div className="flex items-center gap-8 border-t border-border pt-6 w-full justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                  <span className="text-sm font-medium text-foreground">
                    Correct <span className="font-bold ml-1">({results.correctAnswers})</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                  <span className="text-sm font-medium text-foreground">
                    Incorrect <span className="font-bold ml-1">({results.totalQuestions - results.correctAnswers})</span>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Question Review Section */}
        {showQuestionReview && questionsToReview.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Question Review</h2>
                <p className="text-muted-foreground text-sm">Review all quiz questions and your submitted answers.</p>
              </div>
            </div>

            <div className="space-y-4">
              {questionsToReview.map((question, index) => (
                <QuestionItem
                  key={question.id || index}
                  question={question}
                  index={index}
                  userResponse={results.detailedResponses?.find(r => r.questionId === question.id)}
                  showCorrectAnswers={showCorrectAnswers}
                />
              ))}
            </div>
          </div>
        )}

        {/* 4. Footer Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-border">
          <div className="text-center md:text-left flex flex-col md:flex-row items-center gap-2 text-sm">
            <span className="text-muted-foreground">Next recommended module: </span>
            <span className="font-bold text-primary cursor-pointer hover:underline flex items-center gap-1">
              Advanced Hazard Analysis <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              className="px-6 py-5 text-foreground border-border hover:bg-muted font-semibold"
              onClick={() => router.push(`/quiz/start/${selectedQuiz?.id}`)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>

            <Button
              variant="outline"
              className="px-6 py-5 text-foreground border-border hover:bg-muted font-semibold"
              onClick={() => router.push("/user/stats")}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Status
            </Button>

            <Button
              className="px-8 py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg transition-all hover:scale-105"
              onClick={() => router.push("/training")}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}