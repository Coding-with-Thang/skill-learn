"use client"

import { useRouter } from "next/navigation"
import { useQuizStartStore } from "@skill-learn/lib/stores/quizStore.js"
import { Button } from "@skill-learn/ui/components/button"
import { RotateCcw, LayoutDashboard, Eye, Trophy, Timer, CheckCircle, XCircle, ListChecks, Calendar, Star, ArrowRight, ChevronDown, ChevronUp, Crown, PartyPopper, Coins } from 'lucide-react'
import { useEffect, useState } from "react"
import { Card, CardContent } from "@skill-learn/ui/components/card"
import { useAuditLog } from '@/lib/hooks/useAuditLog';
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
    <Card className="border-0 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardContent className="p-0">
        {/* Header - Clickable to toggle */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-6 md:p-8 flex items-start justify-between gap-4 cursor-pointer bg-white hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex gap-3 flex-1">
            <span className="text-lg font-bold text-blue-600 bg-blue-50 w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0">
              {index + 1}.
            </span>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900 pt-0.5 leading-snug">
                {question.text}
              </h3>
              {!isOpen && (
                <p className="text-sm text-slate-400 font-medium">Click to view details</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
              isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {isCorrect ? "Correct" : "Incorrect"}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
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

              // Styling Logic
              let containerClass = "border-slate-200 bg-white hover:bg-slate-50"; // Default
              let labelColor = "text-slate-700";
              let icon = null;

              if (isSelected && isAnswerCorrect) {
                // Correct & Selected (Your Answer) - Green
                containerClass = "border-green-200 bg-green-50 ring-1 ring-green-200";
                labelColor = "text-green-800 font-medium";
                icon = <CheckCircle className="w-5 h-5 text-green-600" />;
              } else if (isSelected && !isAnswerCorrect) {
                // Incorrect & Selected (Your Answer) - Red
                containerClass = "border-red-200 bg-red-50 ring-1 ring-red-200";
                labelColor = "text-red-800 font-medium";
                icon = <XCircle className="w-5 h-5 text-red-600" />;
              } else if (!isSelected && isAnswerCorrect && showCorrectAnswers) {
                // Correct & Not Selected (Missed CA) - Green Outline
                containerClass = "border-green-200 bg-white ring-1 ring-green-100";
                labelColor = "text-green-700 font-medium";
                icon = <CheckCircle className="w-5 h-5 text-green-500 opacity-50" />;
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
                      isSelected ? "border-transparent bg-white/50" : "border-slate-300 bg-slate-50 text-slate-500"
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
                        isAnswerCorrect ? "text-green-600" : "text-red-600"
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
  let pointsIconBg = "bg-blue-100 text-blue-600";
  let pointsCardBg = "bg-white"; // default

  if (isPerfect) {
    PointsIcon = Crown; // or PartyPopper
    pointsIconBg = "bg-yellow-100 text-yellow-600 animate-bounce";
    pointsCardBg = "bg-gradient-to-br from-yellow-50/50 to-orange-50/50";
  } else if (isPassed) {
    PointsIcon = Star;
    pointsIconBg = "bg-blue-100 text-blue-600";
  } else {
    PointsIcon = Coins;
    pointsIconBg = "bg-gray-100 text-gray-500";
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* 1. Quiz Header */}
        <header className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>{selectedQuiz?.category?.name || "Product Knowledge"}</span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate()}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {selectedQuiz?.title || "Assessment Module"}
            </h1>
          </div>

          {/* Stat Cards Row */}
          {/* Order: Final Score -> Correct Answers -> Status -> Points Scored -> Time Taken */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

            {/* 1. Final Score */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Final Score</span>
                  <div className="p-1.5 bg-green-100 text-green-600 rounded-full">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-3xl font-extrabold text-slate-900">{results.score}%</span>
              </CardContent>
            </Card>

            {/* 2. Correct Answers (Moved here) */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Correct Answers</span>
                  <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-full">
                    <ListChecks className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">{results.correctAnswers}</span>
                  <span className="text-sm text-slate-400 font-medium">/ {results.totalQuestions}</span>
                </div>
              </CardContent>
            </Card>

            {/* 3. Status (Moved to Middle) */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</span>
                  <div className={cn("p-1.5 rounded-full", results.hasPassed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                    {results.hasPassed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                </div>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit",
                  results.hasPassed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {results.hasPassed ? "PASSED" : "FAILED"}
                </span>
              </CardContent>
            </Card>

            {/* 4. Points Scored */}
            <Card className={cn("border-0 shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-1", pointsCardBg)}>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Points Scored</span>
                  <div className={cn("p-1.5 rounded-full", pointsIconBg)}>
                    <PointsIcon className={cn("w-4 h-4", isPerfect && "animate-bounce")} />
                  </div>
                </div>
                <span className="text-3xl font-extrabold text-slate-900">
                  {new Intl.NumberFormat().format(results.pointsEarned || 0)}
                </span>
              </CardContent>
            </Card>

            {/* 5. Time Taken */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Time Taken</span>
                  <div className="p-1.5 bg-sky-100 text-sky-600 rounded-full">
                    <Timer className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-3xl font-extrabold text-slate-900">{formatTime(results.timeSpent)}</span>
              </CardContent>
            </Card>
          </div>
        </header>

        {/* 2. Accuracy Visualization */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">Accuracy</h3>
            <div className="flex flex-col items-center justify-center">
              {/* Chart */}
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
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-extrabold text-slate-900">{results.score}%</span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Correct</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-8 border-t pt-6 w-full justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                  <span className="text-sm font-medium text-slate-600">
                    Correct <span className="text-slate-900 font-bold ml-1">({results.correctAnswers})</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                  <span className="text-sm font-medium text-slate-600">
                    Incorrect <span className="text-slate-900 font-bold ml-1">({results.totalQuestions - results.correctAnswers})</span>
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
                <h2 className="text-xl font-bold text-slate-900">Question Review</h2>
                <p className="text-slate-500 text-sm">Review all quiz questions and your submitted answers.</p>
              </div>
              {/* Optional: Add a "Expand All" / "Collapse All" button here if needed */}
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-200">
          <div className="text-center md:text-left flex flex-col md:flex-row items-center gap-2 text-sm">
            <span className="text-slate-500">Next recommended module: </span>
            <span className="font-bold text-blue-600 cursor-pointer hover:underline flex items-center gap-1">
              Advanced Hazard Analysis <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              className="px-6 py-5 text-slate-700 border-slate-300 hover:bg-slate-50 font-semibold"
              onClick={() => router.push(`/quiz/start/${selectedQuiz?.id}`)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>

            <Button
              variant="outline"
              className="px-6 py-5 text-slate-700 border-slate-300 hover:bg-slate-50 font-semibold"
              onClick={() => router.push("/user/stats")}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Status
            </Button>

            <Button
              className="px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105"
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