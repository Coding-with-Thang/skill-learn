"use client"

import { useRouter } from "next/navigation"
import { useQuizStartStore } from "@/app/store/quizStore"
import { Button } from "@/components/ui/button"
import { RotateCcw, LayoutDashboard, Eye, Trophy, Timer, CheckCircle, XCircle, ListChecks, Calendar } from 'lucide-react'
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuditLog } from '@/lib/hooks/useAuditLog';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { cn } from "@/lib/utils"

// Utility function to format time
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const formatDate = (date) => {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function ResultsPage() {
  const router = useRouter();
  const { selectedQuiz, quizResponses } = useQuizStartStore();
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const { logUserAction } = useAuditLog();

  useEffect(() => {
    async function loadResults() {
      if (quizResponses) {
        if (selectedQuiz?.id) {
          // Only log if we haven't already? Or just log. 
          // Note: Moving log logic to successful load to avoid double logging if useEffect re-runs
          // But usually safe here.
        }
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
        console.error('Error parsing quiz results:', error);
        setError(error.message);
        router.replace("/training");
      }
    }
    loadResults();
  }, [quizResponses, router, selectedQuiz]);


  // Effect for logging (separated to ensure results exist)
  useEffect(() => {
    if (results && selectedQuiz?.id) {
      logUserAction(
        'complete',
        'quiz',
        selectedQuiz.id,
        `Completed quiz with score: ${results.score}% (${results.hasPassed ? 'Passed' : 'Failed'})`
      ).catch(e => console.error("Audit log error", e));
    }
  }, [results, selectedQuiz, logUserAction])

  if (error) return null; // Redirecting
  if (!results) return null; // Loading... replace with skeleton if needed but fast usually

  // Data for Pie Chart
  const pieData = [
    { name: 'Correct', value: results.correctAnswers, color: '#22c55e' }, // green-500
    { name: 'Incorrect', value: results.totalQuestions - results.correctAnswers, color: '#ef4444' }, // red-500
  ];

  // Handle case where total is 0 to avoid chart errors
  const chartData = results.totalQuestions > 0 ? pieData : [{ name: 'Empty', value: 1, color: '#e5e7eb' }];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium tracking-wide uppercase">
            <span>{selectedQuiz?.category?.name || "Assessment Module"}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate()}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            {selectedQuiz?.title || "Product Knowledge Assessment"}
          </h1>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Final Score */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <span className="text-slate-500 font-medium">Final Score</span>
                <div className="p-2 bg-green-100 text-green-600 rounded-full">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-900">{results.score}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <span className="text-slate-500 font-medium">Status</span>
                <div className={cn("p-2 rounded-full", results.hasPassed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                  {results.hasPassed ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
              </div>
              <div className="mt-4">
                <span className={cn(
                  "inline-block px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider",
                  results.hasPassed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {results.hasPassed ? "PASSED" : "FAILED"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Correct Answers */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <span className="text-slate-500 font-medium">Correct Answers</span>
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                  <ListChecks className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">{results.correctAnswers}</span>
                <span className="text-lg text-slate-400 font-medium">/ {results.totalQuestions}</span>
              </div>
            </CardContent>
          </Card>

          {/* Time Taken */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <span className="text-slate-500 font-medium">Time Taken</span>
                <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                  <Timer className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-900">{formatTime(results.timeSpent)}</span>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Accuracy Chart Section */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <h3 className="text-lg font-bold text-slate-900 mb-8">Accuracy</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-12">

              {/* Chart */}
              <div className="relative w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-extrabold text-slate-900">{results.score}%</span>
                  <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Correct</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm" />
                  <span className="text-lg font-medium text-slate-600">
                    Correct <span className="text-slate-900 font-bold ml-1">({results.correctAnswers})</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm" />
                  <span className="text-lg font-medium text-slate-600">
                    Incorrect <span className="text-slate-900 font-bold ml-1">({results.totalQuestions - results.correctAnswers})</span>
                  </span>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-200">
          <div className="text-center md:text-left">
            <span className="text-slate-500">Next recommended module: </span>
            <span className="font-bold text-blue-600 cursor-pointer hover:underline">
              Advanced Hazard Analysis
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
              View Stats
            </Button>

            <Button
              className="px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200"
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