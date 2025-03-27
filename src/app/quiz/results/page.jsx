"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQuizStartStore } from "@/app/store/quizStore"
import { usePointsStore } from "@/app/store/pointsStore"
import { Button } from "@/components/ui/button"
import api from "@/utils/axios";
import { Play, ChartNoAxesCombined } from 'lucide-react'
export default function ResultsPage() {
  const router = useRouter();
  const { quizResponses, selectedQuiz } = useQuizStartStore()
  const { addPoints, isLoading } = usePointsStore();

  const ptsAwardedParticipation = 5;
  const ptsAwardedGood = 10;

  const [pointsAwarded, setPointsAwarded] = useState(false);

  const pointsAdded = useRef(false); // Tracks if points have already been added

  const handleAddPoints = async () => {
    if (pointsAdded.current || !quizCompleted) return; // Prevent duplicate API calls or premature calls

    try {
      await addPoints(points, 'quiz_completion');
      pointsAdded.current = true; // Mark points as added
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  useEffect(() => {
    handleAddPoints(); // Automatically call addPoints when the page loads
  }, [quizCompleted]); // Dependency ensures it runs only when quizCompleted changes

  if (!quizResponses || quizResponses.length === 0) {
    return router.push("/training"); ///Redirect to home page
  }

  const correctAnswers = quizResponses.filter(
    (res) => res.isCorrect
  ).length;

  const totalQuestions = quizResponses.length;
  const scorePercentage = (correctAnswers / totalQuestions) * 100;

  //Show message for the score
  let message = "";
  let points = ptsAwardedParticipation

  if (scorePercentage < 25) {
    message = "You need to try harder!";
    // addPoints(ptsAwardedParticipation, 'quiz_completion');
  } else if (scorePercentage >= 25 && scorePercentage < 50) {
    message = "You're getting there! Keep practicing.";
  } else if (scorePercentage >= 50 && scorePercentage < 75) {
    message = "Good effort! You're above average.";
    points = ptsAwardedGood
  } else if (scorePercentage >= 75 && scorePercentage < 100) {
    message = "Great job! You're so close to perfect!";

  } else if (scorePercentage === 100) {
    message = "Outstanding! You got everything right!";
    points = ptsAwardedGood
  }

  return (
    <main className="py-[2.5rem] px-[5rem]">
      <h1 className="text-4xl font-bold text-center mt-10 lg:mt-20">Quiz Results</h1>

      <p className="text-2xl text-center mt-4">
        You scored <span className="text-3xl font-bold">{correctAnswers}</span> out of{" "}
        {""}
        <span className="font-bold">{totalQuestions}</span> {""}
      </p>

      <p className="text-blue-400 font-bold text-4xl text-center">
        {scorePercentage.toFixed()}%
      </p>

      <p className="text-2xl text-center mt-2 font-semibold">{message}</p>
      {!isLoading ?
        <p className="text-lg text-center mt-2">Points earned: {points}</p>
        :
        <p>Loading...</p>
      }
      <div className="flex gap-2 justify-center mt-8">
        <Button
          className="px-10 py-6 font-bold text-xl rounded-xl"
          onClick={() => router.push("/quiz/start/" + `${selectedQuiz.id}`)}
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
    </main >
  )
}