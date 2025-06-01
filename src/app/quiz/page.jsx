"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from "next/navigation"
import { useQuizStartStore } from "@/app/store/quizStore"
import api from "@/utils/axios";
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ArrowBigRightDash, CircleCheckBig } from 'lucide-react'
import Loader from "../components/loader"

// Move button styles to a constant
const getButtonStyles = (isActive) => `
  relative group py-3 w-full text-center border-2 text-lg font-semibold rounded-lg
  hover:bg-[rgba(0,0,0,0.03)] transition-all duration-200 ease-in-out
  ${isActive
    ? "bg-green-100 border-green-500 shadow-[0_.3rem_0_0_#51bf22] hover:bg-green-100 hover:border-green-500"
    : "shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]"
  }
`;

export default function QuizScreenPage() {
  const router = useRouter();
  const { selectedQuiz, setQuizResponses } = useQuizStartStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize from saved progress
  useEffect(() => {
    const savedProgress = sessionStorage.getItem('quizProgress');
    if (savedProgress) {
      const { currentIndex: savedIndex, responses: savedResponses } = JSON.parse(savedProgress);
      setCurrentIndex(savedIndex);
      setResponses(savedResponses);
    }
  }, []);

  // Save progress when it changes
  useEffect(() => {
    if (!isLoading) {
      sessionStorage.setItem('quizProgress', JSON.stringify({
        currentIndex,
        responses
      }));
    }
  }, [currentIndex, responses, isLoading]);

  // Initial loading check
  useEffect(() => {
    if (!selectedQuiz) {
      router.push("/training");
    } else {
      setIsLoading(false);
    }
  }, [selectedQuiz, router]);

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
      const score = responses.reduce((acc, res) => acc + (res.isCorrect ? 1 : 0), 0);

      await Promise.all([
        api.post("/user/quiz/finish", {
          categoryId: selectedQuiz.categoryId,
          quizId: selectedQuiz.id,
          score,
          responses
        }),
        api.post("/user/points/add", {
          amount: score * 10,
          reason: "quiz_completion"
        })
      ]);

      sessionStorage.removeItem('quizProgress'); // Clear progress
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
            <p
              className="py-3 px-6 border-2 text-xl font-bold self-end rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]"
              role="status"
              aria-live="polite"
            >
              Question: <span className="text-2xl">{currentIndex + 1}</span> /{" "}
              <span className="text-xl">{shuffledQuestionsMemo.length}</span>
            </p>
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
            <span className="flex items-center gap-2 bg-green-600">
              <ArrowBigRightDash /> Next
            </span>
          ) : (
            <span className="flex items-center gap-2 bg-white text-black">
              <CircleCheckBig /> Finish
            </span>
          )}
        </Button>
      </div>
    </main>
  );
}