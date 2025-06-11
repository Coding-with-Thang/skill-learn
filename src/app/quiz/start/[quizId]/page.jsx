"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from "@/utils/axios";
import { useQuizStartStore } from '@/app/store/quizStore'
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Play, Trophy, Clock, Target, BarChart2 } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import Loader from '@/app/components/loader'
import BreadCrumbCom from '@/app/components/BreadCrumb'

export default function SelectedQuizPage() {
  const router = useRouter();
  const { selectedQuiz } = useQuizStartStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Define the startQuiz function first since it's used by handleQuizNavigation
  const startQuiz = async () => {
    if (!selectedQuiz?.id || !selectedQuiz?.categoryId) {
      console.error('Invalid quiz data:', selectedQuiz);
      return;
    }

    try {
      await api.post("/user/quiz/start", {
        categoryId: selectedQuiz.categoryId,
        quizId: selectedQuiz.id,
      });
      router.push("/quiz");
    } catch (error) {
      console.error("Error starting quiz: ", error);
      // Handle specific error types
      if (error.response?.status === 401) {
        router.push("/sign-in");
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

  const fetchQuizStats = async () => {
    if (!selectedQuiz?.categoryId) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await api.get(`/user/quiz/stats/${selectedQuiz.categoryId}`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching quiz stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedQuiz) {
      router.push("/training")
      return;
    }
    if (!selectedQuiz.categoryId) {
      console.error("No category ID found for quiz");
      return;
    }
    fetchQuizStats();
  }, [selectedQuiz, router]);

  if (isLoading) return <Loader />;

  return (
    <>
      <BreadCrumbCom
        crumbs={[
          { name: "My Training", href: "training" },
          { name: "Quiz Selection", href: `categories/${selectedQuiz?.categoryId}` }
        ]}
        endtrail={selectedQuiz?.title}
      />
      <section className="py-[6rem] w-[50%] fixed left-1/2 top-[45%] translate-x-[-50%] translate-y-[-50%] p-6 border-2 rounded-xl shadow-[0_.5rem_0_0_rgba(0,0,0,0.1)] mx-auto">
        <h1 className="text-4xl font-bold mb-4">{selectedQuiz?.title}</h1>
        <h2 className="text-xl mb-6">{selectedQuiz?.description}</h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
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