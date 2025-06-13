"use client"

import { useRouter } from "next/navigation"
import { useQuizStartStore } from "@/app/store/quizStore"
import { Button } from "@/components/ui/button"
import { Play, ChartNoAxesCombined, Trophy, Clock, Target } from 'lucide-react'
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuditLog } from '@/lib/hooks/useAuditLog';

// Utility function to format time
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export default function ResultsPage() {
  const router = useRouter();
  const { selectedQuiz, quizResponses } = useQuizStartStore();
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const { logUserAction } = useAuditLog();

  useEffect(() => {
    async function loadResults() {
      console.log('Loading results. Store state:', { quizResponses, selectedQuiz });

      // First try to get results from the store
      if (quizResponses) {
        console.log('Found results in store:', quizResponses);

        // Log the audit event with correct variables
        if (selectedQuiz?.id) {
          await logUserAction(
            'complete',
            'quiz',
            selectedQuiz.id,
            `Completed quiz with score: ${quizResponses.score}% (${quizResponses.hasPassed ? 'Passed' : 'Failed'})`
          );
        }

        setResults(quizResponses);
        return;
      }

      // If not in store, try sessionStorage
      const savedResults = sessionStorage.getItem('lastQuizResults');
      console.log('SessionStorage results:', savedResults);

      if (!savedResults) {
        console.log('No quiz results found in either location');
        setError('No quiz results found');
        router.replace("/training");
        return;
      }

      try {
        const parsedResults = JSON.parse(savedResults);
        console.log('Parsed results:', parsedResults);

        // Validate that we have the required data
        if (!parsedResults || typeof parsedResults.score !== 'number') {
          throw new Error('Invalid quiz results data');
        }

        // Log the audit event for sessionStorage results
        if (selectedQuiz?.id) {
          await logUserAction(
            'complete',
            'quiz',
            selectedQuiz.id,
            `Completed quiz with score: ${parsedResults.score}% (${parsedResults.hasPassed ? 'Passed' : 'Failed'})`
          );
        }

        setResults(parsedResults);
        // Only remove results after successfully loading
        sessionStorage.removeItem('lastQuizResults');
      } catch (error) {
        console.error('Error parsing quiz results:', error);
        setError(error.message);
        router.replace("/training");
      }
    }

    loadResults();
  }, [router, quizResponses, selectedQuiz, logUserAction]);

  // Show error state
  if (error) {
    return (
      <div className="py-[2.5rem] px-[5rem] max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-red-500">Error loading results: {error}</h1>
      </div>
    );
  }

  // Show loading state
  if (!results) {
    return (
      <div className="py-[2.5rem] px-[5rem] max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold">Loading results...</h1>
      </div>
    );
  }

  console.log('Displaying results:', results);
  // Show message for the score
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
    <main className="py-[2.5rem] px-[5rem] max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mt-10 lg:mt-20">Quiz Results</h1>

      {/* Score Display */}
      <div className="mt-8 text-center">
        <p className="text-6xl font-bold text-blue-500 mb-4">{results.score}%</p>
        <p className="text-xl text-gray-600">
          {results.correctAnswers} correct out of {results.totalQuestions} questions
        </p>
        <p className="text-2xl font-semibold mt-4 text-gray-800">{message}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card className="bg-white shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-green-100 rounded-full">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Points Earned</p>
              <p className="text-xl font-bold">{new Intl.NumberFormat().format(results.pointsEarned)}</p>
              {results.pointsBreakdown.bonus > 0 && (
                <p className="text-sm text-green-600">+{new Intl.NumberFormat().format(results.pointsBreakdown.bonus)} bonus!</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Time Taken</p>
              <p className="text-xl font-bold">{formatTime(results.timeSpent)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-xl font-bold">
                {results.hasPassingRequirement
                  ? (results.hasPassed ? "Passed!" : "Not Passed")
                  : "Completed"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Points Breakdown Message */}
      {results.pointsBreakdown.limited && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-800">
            Note: Points were limited by daily cap. Come back tomorrow for more!
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mt-12">
        <Button
          className="px-8 py-6 font-bold text-lg rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => router.push(`/quiz/start/${selectedQuiz?.id}`)}
        >
          <Play className="mr-2" /> Try Again
        </Button>
        <Button
          className="px-8 py-6 font-bold text-lg rounded-xl"
          onClick={() => router.push("/stats")}
        >
          <ChartNoAxesCombined className="mr-2" /> View Stats
        </Button>
      </div>
    </main>
  )
}