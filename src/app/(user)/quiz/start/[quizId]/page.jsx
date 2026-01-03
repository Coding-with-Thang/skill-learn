"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from "@/lib/utils/axios";
import { useQuizStartStore } from '@/lib/store/quizStore'
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Play, Trophy, Clock, Target, BarChart2 } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Loader } from "@/components/ui/loader"
import BreadCrumbCom from "@/components/shared/BreadCrumb"

export default function SelectedQuizPage() {
  const router = useRouter();
  const { selectedQuiz } = useQuizStartStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Define the startQuiz function first since it's used by handleQuizNavigation
  const startQuiz = async () => {
    if (!selectedQuiz?.id || !selectedQuiz?.categoryId) {
      console.error('Invalid quiz data:', selectedQuiz);
      alert('Invalid quiz data. Please try selecting the quiz again.');
      router.push("/training");
      return;
    }

    // Validate that quiz has questions
    if (!selectedQuiz.questions || !Array.isArray(selectedQuiz.questions) || selectedQuiz.questions.length === 0) {
      console.error('Quiz has no questions:', selectedQuiz);
      alert('This quiz has no questions available. Please contact an administrator.');
      return;
    }

    try {
      await api.post("/user/quiz/start", {
        categoryId: selectedQuiz.categoryId,
        quizId: selectedQuiz.id,
      });
      // Clear any previous progress for this quiz
      sessionStorage.removeItem('quizProgress');
      router.push("/quiz");
    } catch (error) {
      console.error("Error starting quiz: ", error);
      // Handle specific error types
      if (error.response?.status === 401) {
        router.push("/sign-in");
      } else {
        alert('Failed to start quiz. Please try again.');
      }
    }
  };

  const handleQuizNavigation = async () => {
    if (!selectedQuiz?.questions?.length) {
      console.error('No questions found for this quiz');
      return;
    }
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
        // API returns { success: true, data: {...} }
        const statsData = response.data?.data || response.data;
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching quiz stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!selectedQuiz) {
      router.push("/training")
      return;
    }
    if (!selectedQuiz.categoryId) {
      console.error("No category ID found for quiz");
      router.push("/training");
      return;
    }
    // Validate that quiz has questions
    if (!selectedQuiz.questions || !Array.isArray(selectedQuiz.questions) || selectedQuiz.questions.length === 0) {
      console.error("Quiz has no questions:", selectedQuiz);
      alert('This quiz has no questions available. Redirecting to training page.');
      router.push("/training");
      return;
    }
    fetchQuizStats();
  }, [selectedQuiz, router]);

  if (isLoading) return <Loader variant="gif" />;

  return (
    <>
      <BreadCrumbCom
        crumbs={[
          { name: "Training", href: "training" }
        ]}
        endtrail={selectedQuiz?.title}
      />
      <section className="w-full max-w-lg mx-auto px-4 sm:px-8 md:px-12 py-8 border-2 rounded-xl shadow-[0_.5rem_0_0_rgba(0,0,0,0.1)]">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{selectedQuiz?.title}</h1>
        <h2 className="text-lg sm:text-xl mb-6">{selectedQuiz?.description}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card className="p-4">
            <CardContent className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Best Score</p>
                <p className="text-xl font-bold">
                  {stats?.bestScore ? `${stats.bestScore.toFixed(1)}%` : 'Not attempted'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="flex items-center gap-3">
              <BarChart2 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-xl font-bold">
                  {stats?.averageScore ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="flex items-center gap-3">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Passing Score</p>
                <p className="text-xl font-bold">{selectedQuiz?.passingScore}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Time Limit</p>
                <p className="text-xl font-bold">
                  {selectedQuiz?.timeLimit ? `${selectedQuiz.timeLimit} min` : 'No limit'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xl">
              Questions: {selectedQuiz?.questions.length}
            </Label>
            <p className="text-sm text-gray-500">
              Attempts: {stats?.attempts || 0} | Completed: {stats?.completed || 0}
            </p>
          </div>

          <div className="w-full flex justify-center">
            <Button
              className="px-10 py-6 font-bold text-white bg-blue-500 text-xl rounded-xl hover:bg-blue-600 transition-colors"
              onClick={startQuiz}
            >
              <span className="flex items-center gap-2">
                <Play className="h-5 w-5" /> Start Quiz
              </span>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}