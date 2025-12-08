"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from "next/navigation"
import { useQuizStartStore } from "@/app/store/quizStore"
import api from "@/utils/axios";
import { Button } from "@/components/ui/button"
import { ArrowBigRightDash, CircleCheckBig } from 'lucide-react'
import Loader from "@/components/shared/loader"
import Image from "next/image"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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
const getButtonStyles = (isActive) => cn(
  "relative group py-3 w-full text-center border-2 text-lg font-semibold rounded-lg transition-all duration-200 ease-in-out",
  isActive
    ? "bg-success text-success-foreground border-success shadow-lg hover:bg-success-hover"
    : "bg-background text-foreground border-border shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent"
);

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

  console.log("selectedQuiz:", selectedQuiz);
  console.log("shuffledQuestionsMemo:", shuffledQuestionsMemo);

  // Memoize shuffled options for current question
  const shuffledOptions = useMemo(() =>
    shuffledQuestionsMemo[currentIndex]?.options
      ? shuffleArray(shuffledQuestionsMemo[currentIndex].options)
      : [],
    [shuffledQuestionsMemo, currentIndex]
  );

  const handleActiveQuestion = useCallback((option) => {
    if (!shuffledQuestionsMemo[currentIndex]) return;

    // Find the correct option from the question's options array
    const correctOption = shuffledQuestionsMemo[currentIndex].options.find(opt => opt.isCorrect);
    console.log("Correct option:", correctOption)

    const response = {
      questionId: shuffledQuestionsMemo[currentIndex].id,
      selectedOptionId: option.id,
      isCorrect: option.id === correctOption?.id, // Now comparing option IDs correctly
      question: shuffledQuestionsMemo[currentIndex].text,
      selectedAnswer: option.text,
      correctAnswer: correctOption?.text
    };

    console.log('Recording response:', {
      question: response.question,
      isCorrect: response.isCorrect,
      selected: response.selectedAnswer,
      correct: response.correctAnswer
    });

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
      const totalQuestions = shuffledQuestionsMemo.length;

      // Validate that we have questions
      if (!totalQuestions || totalQuestions === 0) {
        console.error('No questions found in quiz');
        toast.error("Quiz has no questions. Please contact support.");
        router.replace("/training");
        return;
      }

      // Log the responses to check what we have
      console.log('All responses:', responses);

      // Log raw responses first
      console.log('Raw responses:', responses);

      // Count correct answers more explicitly with detailed logging
      const correctAnswers = responses.reduce((count, response) => {
        console.log('Checking response:', {
          question: response.question,
          isCorrect: response.isCorrect,
          currentCount: count
        });

        // Ensure isCorrect is treated as a boolean
        return count + (Boolean(response.isCorrect) ? 1 : 0);
      }, 0);

      // Log final tally
      console.log('Final correct answers count:', {
        total: correctAnswers,
        outOf: totalQuestions,
        responses: responses.length
      });

      // Calculate score percentage with validation to prevent division by zero
      // Ensure we have valid numbers and handle edge cases
      const scorePercentage = totalQuestions > 0
        ? Math.max(0, Math.min(100, (correctAnswers / totalQuestions) * 100))
        : 0;

      // Validate the score is a valid number
      if (isNaN(scorePercentage) || !isFinite(scorePercentage)) {
        console.error('Invalid score calculation:', { correctAnswers, totalQuestions, scorePercentage });
        toast.error("Error calculating score. Please try again.");
        router.replace("/training");
        return;
      }

      console.log('Score percentage:', scorePercentage.toFixed(2));

      // Store detailed response data
      const detailedResponses = responses.map(response => ({
        questionId: response.questionId,
        question: response.question,
        selectedAnswer: response.selectedAnswer,
        correctAnswer: response.correctAnswer,
        isCorrect: response.isCorrect
      }));

      const hasPassed = selectedQuiz.passingScore
        ? scorePercentage >= selectedQuiz.passingScore
        : true;
      const hasPassingRequirement = !!selectedQuiz.passingScore;
      const passingScore = selectedQuiz.passingScore || 0;
      const isPerfectScore = scorePercentage === 100;      // Initialize points calculation variables
      let pointsEarned = 0;
      let remainingDailyPoints = 0;
      const pointsBreakdown = {
        correct: 0,
        bonus: 0,
        limited: false
      };

      // Get quiz settings and points status
      try {
        // Get quiz system settings and daily status in parallel
        const [quizSettings, dailyStatus] = await Promise.all([
          api.get("/quiz/settings"),
          api.get("/user/points/daily-status")
        ]);

        // Extract limits from quiz settings
        const dailyPointsLimit = quizSettings.data.dailyPointsLimit || 10000;
        const pointsPerQuestion = quizSettings.data.pointsPerQuestion || 1000;

        // Calculate remaining points
        const todaysPoints = dailyStatus.data.todaysPoints || 0;
        remainingDailyPoints = dailyPointsLimit - todaysPoints;

        // Calculate raw points (before daily limit)
        const rawPoints = correctAnswers * pointsPerQuestion;
        const rawBonus = isPerfectScore ? rawPoints : 0;

        // Apply daily limit
        pointsBreakdown.correct = Math.min(rawPoints, remainingDailyPoints);
        if (pointsBreakdown.correct < rawPoints) {
          pointsBreakdown.limited = true;
        }

        // Apply bonus if within limit
        const remainingAfterCorrect = remainingDailyPoints - pointsBreakdown.correct;
        pointsBreakdown.bonus = Math.min(rawBonus, remainingAfterCorrect);

        pointsEarned = pointsBreakdown.correct + pointsBreakdown.bonus;

        console.log('Final points calculation:', {
          rawPoints,
          rawBonus,
          pointsBreakdown,
          pointsEarned,
          dailyPointsLimit,
          remainingDailyPoints
        });

      } catch (error) {
        console.error('Error calculating points:', error);
        // Use default values if API calls fail
        pointsEarned = correctAnswers * 1000;
        console.log('Using default points calculation:', pointsEarned);
      }

      const timeSpent = selectedQuiz?.timeLimit
        ? (selectedQuiz.timeLimit * 60) - timeRemaining
        : 0;

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
        timeSpent: Number(timeSpent),
        detailedResponses // Add detailed responses for review
      };

      console.log('Quiz complete, saving results:', resultsData);

      // Save results in this order:
      // 1. Store state (immediate)
      await setQuizResponses(resultsData);

      // 2. Session storage (backup)
      sessionStorage.setItem('lastQuizResults', JSON.stringify(resultsData));

      // 3. Server save with retry
      try {
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
      } catch (serverError) {
        // Log the error but don't fail the whole operation
        console.error("Server save failed:", serverError);
        toast.error("Could not save results to server, but your progress is saved locally");
        // Continue to results page anyway
      }

      // Clean up and navigate
      sessionStorage.removeItem('quizProgress');
      router.replace("/quiz/results");
    } catch (error) {
      console.error("Quiz completion error:", error);

      // Save results locally even if there's an error
      try {
        // Calculate score safely in error handler
        const totalQuestions = shuffledQuestionsMemo.length;
        const correctAnswers = responses.reduce((count, response) => {
          return count + (Boolean(response.isCorrect) ? 1 : 0);
        }, 0);
        const scorePercentage = totalQuestions > 0
          ? Math.max(0, Math.min(100, (correctAnswers / totalQuestions) * 100))
          : 0;

        const emergencyResults = {
          score: isNaN(scorePercentage) || !isFinite(scorePercentage) ? 0 : scorePercentage,
          correctAnswers,
          totalQuestions,
          timeSpent: selectedQuiz?.timeLimit ? (selectedQuiz.timeLimit * 60) - timeRemaining : 0
        };
        sessionStorage.setItem('lastQuizResults', JSON.stringify(emergencyResults));

        // Navigate to results even if there's an error
        router.replace("/quiz/results");
      } catch (backupError) {
        console.error("Emergency backup failed:", backupError);
        toast.error("Failed to save quiz results. Please try again or contact support.");
      }
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
      sessionStorage.removeItem('lastQuizResults');
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
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 md:px-12 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{selectedQuiz?.title}</h1>
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            Question {currentIndex + 1} of {shuffledQuestionsMemo.length}
          </p>
          {timeRemaining > 0 && (
            <p className="text-muted-foreground">
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
              <h2 className="text-xl font-semibold mb-6 text-foreground">
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
                    <CircleCheckBig className="absolute right-4 top-1/2 -translate-y-1/2 text-success" />
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