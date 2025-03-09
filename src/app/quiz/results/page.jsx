"use client"

import { useRouter } from "next/navigation"
import { useQuizStartStore } from "@/app/store/quizStore"
import { Button } from "@/components/ui/button"
import { Play } from 'lucide-react'
export default function ResultsPage() {
  const router = useRouter();
  const { quizResponses, selectedQuiz } = useQuizStartStore()

  if (!quizResponses || quizResponses.length === 0) {
    return router.push("/training"); /// redirect to home page
  }

  //Calculate the score
  const correctAnswers = quizResponses.filter(
    (res) => res.isCorrect
  ).length;

  const totalQuestions = quizResponses.length;
  const scorePercentage = (correctAnswers / totalQuestions) * 100;

  //Show message for the score
  let message = "";

  if (scorePercentage < 25) {
    message = "You need to try harder!";
  } else if (scorePercentage >= 25 && scorePercentage < 50) {
    message = "You're getting there! Keep practicing.";
  } else if (scorePercentage >= 50 && scorePercentage < 75) {
    message = "Good effort! You're above average.";
  } else if (scorePercentage >= 75 && scorePercentage < 100) {
    message = "Great job! You're so close to perfect!";
  } else if (scorePercentage === 100) {
    message = "Outstanding! You got everything right!";
  }

  return (
    <main className="py-[2.5rem] px-[5rem] min-h-screen">
      <h1 className="text-4xl font-bold text-center">Quiz Results</h1>

      <p className="text-2xl text-center mt-4">
        You scored <span className="text-3xl font-bold">{correctAnswers}</span> out of{" "}
        {""}
        <span className="font-bold">{totalQuestions}</span> {""}
      </p>

      <p className="text-blue-400 font-bold text-4xl text-center">
        {scorePercentage.toFixed()}%
      </p>

      <p className="text-2xl text-center mt-2 font-semibold">{message}</p>

      <div className="flex justify-center mt-8">
        <Button
          className="px-10 py-6 font-bold text-xl rounded-xl"
          onClick={() => router.push("/quiz/start/" + `${selectedQuiz.id}`)}
        >
          <Play /> Play Again
        </Button>
      </div>
    </main>
  )
}