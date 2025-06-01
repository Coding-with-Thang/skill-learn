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

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
  }, [currentIndex, responses, isLoading, selectedQuiz]);

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
  }, [activeQuestion]);

  // Fisher-Yates Shuffle Algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; --i) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

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

  const handleActiveQuestion = (option) => {
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
  };

  const handleNextQuestion = async () => {
    setIsTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Smooth transition
    setCurrentIndex((prev) => prev + 1);
    setActiveQuestion(null);
    setIsTransitioning(false);
  };

  const handleFinishQuiz = async () => {
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
        bonus: 0
      };

      if (hasPassingRequirement) {
        // With passing score requirement
        if (hasPassed) {
          pointsBreakdown.correct = correctAnswers * 10; // 10 points per correct answer
          if (isPerfectScore) {
            pointsBreakdown.bonus = pointsBreakdown.correct; // Double points for perfect score
          }
        }
      } else {
        // No passing score - half points per correct answer
        pointsBreakdown.correct = correctAnswers * 5; // 5 points per correct answer
        if (isPerfectScore) {
          pointsBreakdown.bonus = pointsBreakdown.correct; // Double points for perfect score
        }
      }

      // Calculate total points
      pointsEarned = pointsBreakdown.correct + pointsBreakdown.bonus;

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

      // Award points
      if (pointsEarned > 0) {
        await api.post("/user/points/add", {
          amount: pointsEarned,
          reason: isPerfectScore ? "perfect_quiz_completion" : "quiz_completion",
          breakdown: pointsBreakdown
        });
      }

      // Show appropriate success message
      let message = '';
      if (hasPassingRequirement) {
        if (hasPassed) {
          message = isPerfectScore
            ? `Perfect score! You earned ${pointsEarned} points (2x bonus)! 🎉`
            : `Quiz passed! You earned ${pointsBreakdown.correct} points! 🎉`;
        } else {
          message = `Quiz not passed. Required score: ${passingScore}%. Your score: ${scorePercentage.toFixed(1)}%. No points earned.`;
        }
      } else {
        if (isPerfectScore) {
          message = `Perfect score! You earned ${pointsEarned} points (2x bonus)! 🎉`;
        } else {
          message = `Quiz completed! You earned ${pointsBreakdown.correct} points!`;
        }
      }

      toast.success(message);

      // Store results for the results page
      sessionStorage.setItem('lastQuizResults', JSON.stringify({
        score: scorePercentage,
        pointsEarned,
        pointsBreakdown,
        hasPassed,
        isPerfectScore,
        hasPassingRequirement,
        passingScore,
        totalQuestions,
        correctAnswers,
        timeSpent
      }));

      sessionStorage.removeItem('quizProgress');
      router.push("/quiz/results");
    } catch (error) {
      console.error("Error finishing quiz:", error);
      toast.error("Failed to submit quiz results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizNavigation = async () => {
    if (!activeQuestion?.id) {
      toast.error("Please select an option to continue");
      return;
    }

    if (currentIndex < shuffledQuestionsMemo.length - 1) {
      await handleNextQuestion();
    } else {
      await handleFinishQuiz();
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (responses.length > 0) {
        // Save progress
        sessionStorage.setItem('quizProgress', JSON.stringify({
          quizId: selectedQuiz.id,
          currentIndex,
          responses,
          timestamp: Date.now()
        }));

        // Show confirmation dialog
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [responses, currentIndex, selectedQuiz]);

  // Handle timer expiration
  const handleTimeUp = useCallback(async () => {
    toast.error("Time's up! Submitting your quiz.");
    await handleFinishQuiz();
  }, []);

  // Timer effect
  useEffect(() => {
    if (selectedQuiz?.timeLimit && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [selectedQuiz, timeRemaining, handleTimeUp]);

  useEffect(() => {
    return () => {
      // Clean up when component unmounts
      if (!responses.length) {
        sessionStorage.removeItem('quizProgress');
      }
    };
  }, [responses]);

  if (isLoading) return <Loader />;

  return (
    <main
      className={`py-[2.5rem] px-[5rem] ${isTransitioning ? 'opacity-50' : ''}`}
      role="main"
      aria-label="Quiz Page"
    >
      {shuffledQuestionsMemo[currentIndex] ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <p
                className="py-3 px-6 border-2 text-xl font-bold rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]"
                role="status"
                aria-live="polite"
              >
                Question: <span className="text-2xl">{currentIndex + 1}</span> /{" "}
                <span className="text-xl">{shuffledQuestionsMemo.length}</span>
              </p>

              {/* Timer Display */}
              {selectedQuiz?.timeLimit && (
                <div
                  className={`py-3 px-6 border-2 text-xl font-bold rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]
                    ${timeRemaining <= 60 ? 'text-red-500 animate-pulse' : ''}`}
                  role="timer"
                  aria-label="Time remaining"
                >
                  Time: {formatTime(timeRemaining)}
                </div>
              )}
            </div>
            <h1
              className="mt-4 px-10 text-5xl font-bold text-center"
              role="heading"
              aria-level="1"
            >
              {shuffledQuestionsMemo[currentIndex].text}
            </h1>
          </div>

          <div
            className="pt-14 space-y-4"
            role="radiogroup"
            aria-label="Quiz options"
          >
            {shuffledOptions.map((option, index) => (
              <button
                key={option.id}
                className={getButtonStyles(option.text === activeQuestion?.text)}
                onClick={() => handleActiveQuestion(option)}
                aria-pressed={option.text === activeQuestion?.text}
                aria-label={`Option ${index + 1}: ${option.text}`}
                disabled={isTransitioning}
              >
                {option.text}
              </button>
            ))}
          </div>

          {/* Points Info */}
          <div className="text-center text-sm text-gray-600">
            {selectedQuiz.passingScore !== undefined && selectedQuiz.passingScore !== null ? (
              <>
                <p>Must achieve {selectedQuiz.passingScore}% to earn points</p>
                <p>Earn 10 points per correct answer when passing score is achieved</p>
                <p>Perfect score doubles your points! 🌟</p>
              </>
            ) : (
              <>
                <p>Earn 5 points per correct answer</p>
                <p>Perfect score doubles your points! 🌟</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <p className="text-lg" role="alert">No questions found for this quiz</p>
      )}

      <div className="w-full py-[4rem] border-t-2 flex items-center justify-center">
        <Button
          className="px-10 py-6 font-bold text-xl rounded-xl"
          variant="destructive"
          onClick={handleQuizNavigation}
          disabled={isTransitioning || !activeQuestion}
        >
          {currentIndex < shuffledQuestionsMemo.length - 1 ? (
            <span className="flex items-center gap-2">
              <ArrowBigRightDash /> Next
            </span>
          ) : (
            <span className="flex items-center gap-2 text-black">
              <CircleCheckBig /> Finish
            </span>
          )}
        </Button>
      </div>
    </main>
  );
}