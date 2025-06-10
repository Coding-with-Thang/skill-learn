"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from "next/navigation"
import { useQuizStartStore } from "@/app/store/quizStore"
import api from "@/utils/axios";
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ArrowBigRightDash, CircleCheckBig } from 'lucide-react'
import Loader from "../components/loader"
import Image from "next/image"

// Utility functions
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Fisher-Yates Shuffle Algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Move button styles to a constant
const getButtonStyles = (isActive) => `
  relative group py-3 w-full text-center border-2 text-lg font-semibold rounded-lg
  hover:bg-[rgba(0,0,0,0.03)] transition-all duration-200 ease-in-out
  ${isActive
    ? "bg-green-100 border-green-500 shadow-[0_.3rem_0_0_#51bf22] hover:bg-green-100 hover:border-green-500"
    : "shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]"
  }
`;

const QuestionMedia = ({ question }) => {
  const [mediaError, setMediaError] = useState(false);

  if (!question.imageUrl || mediaError) {
    return null;
  }

  return (
    <div className="relative w-full h-48 mb-4">
      <Image
        src={question.imageUrl}
        alt="Question illustration"
        layout="fill"
        objectFit="contain"
        onError={() => setMediaError(true)}
      />
    </div>
  );
};

export default function QuizScreenPage() {
  const router = useRouter();
  const { selectedQuiz, setQuizResponses } = useQuizStartStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(
    selectedQuiz?.timeLimit ? selectedQuiz.timeLimit * 60 : 0
  );

  // Memoize shuffled questions
  const shuffledQuestionsMemo = useMemo(() =>
    selectedQuiz ? shuffleArray(selectedQuiz.questions) : [],
    [selectedQuiz]
  );

  // Memoize shuffled options for current question
  const shuffledOptions = useMemo(() =>
    shuffledQuestionsMemo[currentIndex]?.options
      ? shuffleArray(shuffledQuestionsMemo[currentIndex].options)
      : [],
    [shuffledQuestionsMemo, currentIndex]
  );

  const handleActiveQuestion = useCallback((option) => {
    if (!shuffledQuestionsMemo[currentIndex]) return;

    const response = {
      questionId: shuffledQuestionsMemo[currentIndex].id,
      optionId: option.id,
      isCorrect: option.isCorrect
    };

    setResponses((prev) => {
      const existingIndex = prev.findIndex((res) =>
        res.questionId === response.questionId
      );

      if (existingIndex !== -1) {
        const updatedResponses = [...prev];
        updatedResponses[existingIndex] = response;
        return updatedResponses;
      }
      return [...prev, response];
    });

    setActiveQuestion(option);
  }, [shuffledQuestionsMemo, currentIndex]);

  const handleNextQuestion = useCallback(async () => {
    setIsTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Smooth transition
    setCurrentIndex((prev) => prev + 1);
    setActiveQuestion(null);
    setIsTransitioning(false);
  }, []);

  const handleFinishQuiz = useCallback(async () => {
    try {
      setIsLoading(true);
      setQuizResponses(responses);

      // Calculate score and percentage
      const totalQuestions = shuffledQuestionsMemo.length;
      const correctAnswers = responses.reduce((acc, res) => acc + (res.isCorrect ? 1 : 0), 0);
      const scorePercentage = (correctAnswers / totalQuestions) * 100;
      const isPerfectScore = scorePercentage === 100;

      // Determine if quiz has a passing score requirement
      const hasPassingRequirement = selectedQuiz.passingScore !== undefined && selectedQuiz.passingScore !== null;
      const passingScore = selectedQuiz.passingScore || 0;
      const hasPassed = hasPassingRequirement ? scorePercentage >= passingScore : true;

      // Calculate points
      let pointsEarned = 0;
      let pointsBreakdown = {
        correct: 0,
        bonus: 0,
        limited: false
      };

      // Get daily points status
      const dailyStatus = await api.get("/user/points/daily-status");
      const remainingDailyPoints = 100000 - (dailyStatus.data.todaysPoints || 0);

      if (hasPassingRequirement) {
        // With passing score requirement
        if (hasPassed) {
          // Calculate raw points (before daily limit)
          const rawPoints = correctAnswers * 1000; // 1000 points per correct answer
          const rawBonus = isPerfectScore ? rawPoints : 0; // Double points for perfect score

          // Apply daily limit
          pointsBreakdown.correct = Math.min(rawPoints, remainingDailyPoints);
          if (pointsBreakdown.correct < rawPoints) {
            pointsBreakdown.limited = true;
          }

          // Only apply bonus if there's room in daily limit
          if (isPerfectScore && remainingDailyPoints > pointsBreakdown.correct) {
            pointsBreakdown.bonus = Math.min(rawBonus, remainingDailyPoints - pointsBreakdown.correct);
          }
        }
      } else {
        // No passing score - half points per correct answer
        const rawPoints = correctAnswers * 500; // 500 points per correct answer
        const rawBonus = isPerfectScore ? rawPoints : 0; // Double points for perfect score

        // Apply daily limit
        pointsBreakdown.correct = Math.min(rawPoints, remainingDailyPoints);
        if (pointsBreakdown.correct < rawPoints) {
          pointsBreakdown.limited = true;
        }

        // Only apply bonus if there's room in daily limit
        if (isPerfectScore && remainingDailyPoints > pointsBreakdown.correct) {
          pointsBreakdown.bonus = Math.min(rawBonus, remainingDailyPoints - pointsBreakdown.correct);
        }
      }

      // Calculate total points
      pointsEarned = pointsBreakdown.correct + pointsBreakdown.bonus;

      // Format points with commas
      const formatNumber = (num) => new Intl.NumberFormat().format(num);

      const timeSpent = selectedQuiz?.timeLimit
        ? (selectedQuiz.timeLimit * 60) - timeRemaining
        : 0;

      // Save quiz results
      await api.post("/user/quiz/finish", {
        categoryId: selectedQuiz.categoryId,
        quizId: selectedQuiz.id,
        score: scorePercentage,
        responses,
        timeSpent,
        hasPassed,
        isPerfectScore,
        pointsBreakdown
      });

      // Show results with point breakdown
      toast({
        title: "Quiz Completed!",
        description: (
          <div className="mt-2 space-y-2">
            <p>Score: {scorePercentage.toFixed(1)}%</p>
            <p>Points earned: {formatNumber(pointsEarned)}</p>
            {pointsBreakdown.limited && (
              <p className="text-yellow-600">
                Note: Points were limited by daily cap. Come back tomorrow for more!
              </p>
            )}
          </div>
        ),
        duration: 5000,
      });

      // Store results for the results page
      const resultsData = {
        score: Number(scorePercentage.toFixed(1)),
        pointsEarned: Number(pointsEarned),
        pointsBreakdown: {
          correct: Number(pointsBreakdown.correct),
          bonus: Number(pointsBreakdown.bonus),
          limited: Boolean(pointsBreakdown.limited)
        },
        hasPassed: Boolean(hasPassed),
        isPerfectScore: Boolean(isPerfectScore),
        hasPassingRequirement: Boolean(hasPassingRequirement),
        passingScore: Number(passingScore),
        totalQuestions: Number(totalQuestions),
        correctAnswers: Number(correctAnswers),
        timeSpent: Number(timeSpent)
      };

      sessionStorage.setItem('lastQuizResults', JSON.stringify(resultsData));

      sessionStorage.removeItem('quizProgress');
      router.push("/quiz/results");
    } catch (error) {
      console.error("Error finishing quiz:", error);
      toast.error("Failed to submit quiz results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [responses, shuffledQuestionsMemo.length, selectedQuiz, timeRemaining, router, setQuizResponses]);

  const handleQuizNavigation = useCallback(async () => {
    if (!activeQuestion?.id) {
      toast.error("Please select an option to continue");
      return;
    }

    if (currentIndex < shuffledQuestionsMemo.length - 1) {
      await handleNextQuestion();
    } else {
      await handleFinishQuiz();
    }
  }, [activeQuestion, currentIndex, shuffledQuestionsMemo.length, handleNextQuestion, handleFinishQuiz]);

  // Clear any existing progress when component mounts with a new quiz
  useEffect(() => {
    if (selectedQuiz) {
      sessionStorage.removeItem('quizProgress');
      setCurrentIndex(0);
      setResponses([]);
      setActiveQuestion(null);
      setIsLoading(false);
    } else {
      router.push("/training");
    }
  }, [selectedQuiz, router]);

  // Save progress during the quiz
  useEffect(() => {
    if (!isLoading && selectedQuiz && currentIndex < shuffledQuestionsMemo.length - 1) {
      sessionStorage.setItem('quizProgress', JSON.stringify({
        quizId: selectedQuiz.id,
        currentIndex,
        responses
      }));
    }
  }, [currentIndex, responses, isLoading, selectedQuiz, shuffledQuestionsMemo.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && activeQuestion) {
        handleQuizNavigation();
      }
      // Allow selecting options with number keys 1-4
      if (['1', '2', '3', '4'].includes(e.key)) {
        const index = parseInt(e.key) - 1;
        if (shuffledOptions[index]) {
          handleActiveQuestion(shuffledOptions[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeQuestion, handleQuizNavigation, shuffledOptions, handleActiveQuestion]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{selectedQuiz?.title}</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Question {currentIndex + 1} of {shuffledQuestionsMemo.length}
          </p>
          {timeRemaining > 0 && (
            <p className="text-gray-600">
              Time remaining: {formatTime(timeRemaining)}
            </p>
          )}
        </div>
      </div>

      <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {shuffledQuestionsMemo[currentIndex] && (
          <>
            <div className="mb-8">
              <QuestionMedia question={shuffledQuestionsMemo[currentIndex]} />
              <h2 className="text-xl font-semibold mb-6">
                {shuffledQuestionsMemo[currentIndex].text}
              </h2>
            </div>

            <div className="space-y-4">
              {shuffledOptions.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => handleActiveQuestion(option)}
                  disabled={isTransitioning}
                  className={getButtonStyles(activeQuestion?.id === option.id)}
                >
                  {String.fromCharCode(65 + index)}. {option.text}
                  {activeQuestion?.id === option.id && (
                    <CircleCheckBig className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleQuizNavigation}
          disabled={!activeQuestion || isTransitioning}
          className="text-lg py-6 px-8"
        >
          {currentIndex < shuffledQuestionsMemo.length - 1 ? (
            <>
              Next <ArrowBigRightDash className="ml-2" />
            </>
          ) : (
            'Finish Quiz'
          )}
        </Button>
      </div>
    </div>
  );
}