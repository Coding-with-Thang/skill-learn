"use client"

import { useRouter } from "next/navigation"
import { useQuizStartStore } from "@/app/store/quizStore"
import { Button } from "@/components/ui/button"
import { Play, ChartNoAxesCombined } from 'lucide-react'
import { useEffect, useState } from "react"

export default function ResultsPage() {
  const router = useRouter();
  const { selectedQuiz } = useQuizStartStore()
  const [results, setResults] = useState(null);

  useEffect(() => {
    // Get results from sessionStorage
    const savedResults = sessionStorage.getItem('lastQuizResults');
    if (!savedResults) {
      router.push("/training");
      return;
    }
    try {
      const parsedResults = JSON.parse(savedResults);
      setResults(parsedResults);
    } catch (error) {
      console.error('Error parsing quiz results:', error);
      router.push("/training");
    }
  }, [router]);

  if (!results) {
    return null; // Return null while loading or redirecting
  }

  //Show message for the score
  let message = "";
  if (results.score < 25) {
    message = "You need to try harder!";
  } else if (results.score >= 25 && results.score < 50) {
    message = "You're getting there! Keep practicing.";
  } else if (results.score >= 50 && results.score < 75) {
    message = "Good effort! You're above average.";
  } else if (results.score >= 75 && results.score < 100) {
    message = "Great job! You're so close to perfect!";
  } else if (results.score === 100) {
    message = "Outstanding! You got everything right!";
  }

  return (
    <main className="py-[2.5rem] px-[5rem]">
      <h1 className="text-4xl font-bold text-center mt-10 lg:mt-20">Quiz Results</h1>
      <p className="text-2xl text-center mt-4">
        You scored <span className="text-3xl font-bold">{results.correctAnswers}</span> out of{" "}
        <span className="font-bold">{results.totalQuestions}</span>
      </p>
      <p className="text-blue-400 font-bold text-4xl text-center">
        {results.score}%
      </p>
      <p className="text-2xl text-center mt-2 font-semibold">{message}</p>
      {results.pointsEarned > 0 && (
        <p className="text-xl text-center mt-4 text-green-600">
          Points earned: {new Intl.NumberFormat().format(results.pointsEarned)}
          {results.pointsBreakdown.limited && (
            <span className="block text-sm text-yellow-600 mt-1">
              Note: Points were limited by daily cap. Come back tomorrow for more!
            </span>
          )}
        </p>
      )}
      <div className="flex gap-2 justify-center mt-8">
        <Button
          className="px-10 py-6 font-bold text-xl rounded-xl"
          onClick={() => router.push(`/quiz/start/${selectedQuiz?.id}`)}
        >
          <Play /> Play Again
        </Button>
        <Button
          className="px-10 py-6 font-bold text-xl rounded-xl"
          onClick={() => router.push("/stats")}
        >
          <ChartNoAxesCombined /> View Stats
        </Button>
      </div>
    </main>
  )
}