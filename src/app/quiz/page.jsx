"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from "next/navigation"
import { useQuizStartStore } from "@/app/store/quizStore"
import api from "@/utils/axios";
import { Button } from "@/components/ui/button"
import { ArrowBigRightDash, CircleCheckBig, Clock, X, ChevronLeft, ChevronRight, BarChart2, GraduationCap, Check } from 'lucide-react'
import { Loader } from "@/components/ui/loader"
import Image from "next/image"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { UI } from "@/constants"
import { handleErrorWithNotification } from "@/utils/notifications"

// Utility functions
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')} : ${remainingSeconds.toString().padStart(2, '0')}`;
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

const QuestionMedia = ({ question }) => {
    const [mediaError, setMediaError] = useState(false);

    // If no media exists or there's an error, don't render anything
    if (mediaError || (!question.imageUrl && !question.videoUrl)) {
        return null;
    }

    // Render video if videoUrl exists
    if (question.videoUrl) {
        return (
            <div className="relative w-full h-64 mb-8 bg-secondary/10 rounded-xl overflow-hidden">
                <video
                    src={question.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    onError={() => setMediaError(true)}
                />
            </div>
        );
    }

    // Render image if imageUrl exists
    if (question.imageUrl) {
        return (
            <div className="relative w-full h-64 mb-8 bg-secondary/10 rounded-xl overflow-hidden">
                <Image
                    src={question.imageUrl}
                    alt="Question illustration"
                    layout="fill"
                    objectFit="contain"
                    onError={() => setMediaError(true)}
                />
            </div>
        );
    }

    return null;
};

export default function QuizScreenPage() {
    const router = useRouter();
    const { selectedQuiz, setQuizResponses } = useQuizStartStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState([]); // Array of selected option IDs
    const [responses, setResponses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(
        selectedQuiz?.timeLimit ? selectedQuiz.timeLimit * 60 : 0
    );

    // Refs to store latest values for timer callback
    const currentIndexRef = useRef(currentIndex);
    const selectedOptionsRef = useRef(selectedOptions);
    const responsesRef = useRef(responses);

    // Keep refs in sync with state
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        selectedOptionsRef.current = selectedOptions;
    }, [selectedOptions]);

    useEffect(() => {
        responsesRef.current = responses;
    }, [responses]);

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

    // Load saved state from session storage on mount
    useEffect(() => {
        if (selectedQuiz) {
            const savedProgress = sessionStorage.getItem('quizProgress');
            if (savedProgress) {
                try {
                    const { currentIndex: savedIndex, responses: savedResponses } = JSON.parse(savedProgress);
                    // Validate quiz ID matches
                    const savedQuizId = JSON.parse(savedProgress).quizId;
                    if (savedQuizId === selectedQuiz.id) {
                        setCurrentIndex(savedIndex);
                        setResponses(savedResponses);

                        // Restore selection for current question if it exists in responses
                        const currentQuestionId = shuffledQuestionsMemo[savedIndex]?.id;
                        const existingResponse = savedResponses.find(r => r.questionId === currentQuestionId);
                        if (existingResponse) {
                            setSelectedOptions(existingResponse.selectedOptionIds || []);
                        }
                    }
                } catch (e) {
                    // Error loading saved progress - not critical, just continue
                    // Only log for debugging
                    if (process.env.NODE_ENV === "development") {
                        console.error("Error loading progress", e);
                    }
                }
            }
            setIsLoading(false);
        } else {
            router.push("/training");
        }
    }, [selectedQuiz, router, shuffledQuestionsMemo]);


    // Update local selection state when index changes
    useEffect(() => {
        if (shuffledQuestionsMemo[currentIndex]) {
            const currentQuestionId = shuffledQuestionsMemo[currentIndex].id;
            const existingResponse = responses.find(r => r.questionId === currentQuestionId);
            if (existingResponse) {
                setSelectedOptions(existingResponse.selectedOptionIds || []);
            } else {
                setSelectedOptions([]);
            }
        }
    }, [currentIndex, shuffledQuestionsMemo, responses]);


    const handleFinishQuiz = useCallback(async () => {
        setIsLoading(true);
        try {
            // Use refs to get latest values (important for timer expiration)
            const currentIdx = currentIndexRef.current;
            const currentSelected = selectedOptionsRef.current;
            const currentResponses = responsesRef.current;

            const totalQuestions = shuffledQuestionsMemo.length;

            // Build complete responses array including current question
            // Start with existing responses
            let finalResponses = [...currentResponses];

            // Ensure current question's response is included and up-to-date
            if (shuffledQuestionsMemo[currentIdx]) {
                const currentQuestion = shuffledQuestionsMemo[currentIdx];
                const correctOptions = currentQuestion.options.filter(opt => opt.isCorrect);
                const correctOptionIds = correctOptions.map(opt => opt.id);

                // Calculate correctness for current question
                const isCorrect =
                    currentSelected.length === correctOptionIds.length &&
                    currentSelected.every(id => correctOptionIds.includes(id));

                const currentResponse = {
                    questionId: currentQuestion.id,
                    selectedOptionIds: [...currentSelected], // Copy array
                    isCorrect: isCorrect,
                    question: currentQuestion.text,
                    selectedAnswer: currentQuestion.options.filter(opt => currentSelected.includes(opt.id)).map(o => o.text).join(", "),
                    correctAnswer: correctOptions.map(o => o.text).join(", ")
                };

                // Update or add current response
                const existingIndex = finalResponses.findIndex((res) =>
                    res.questionId === currentResponse.questionId
                );

                if (existingIndex !== -1) {
                    finalResponses[existingIndex] = currentResponse;
                } else {
                    finalResponses.push(currentResponse);
                }
            }

            // Recalculate correctness for all responses to ensure accuracy
            finalResponses = finalResponses.map(response => {
                const question = shuffledQuestionsMemo.find(q => q.id === response.questionId);
                if (!question) return response;

                const correctOptions = question.options.filter(opt => opt.isCorrect);
                const correctOptionIds = correctOptions.map(opt => opt.id);

                // Recalculate correctness
                const isCorrect =
                    response.selectedOptionIds.length === correctOptionIds.length &&
                    response.selectedOptionIds.every(id => correctOptionIds.includes(id));

                return {
                    ...response,
                    isCorrect: isCorrect
                };
            });

            // Save final responses to state
            setResponses(finalResponses);

            // Count correct answers
            // Questions without responses are treated as incorrect (not counted in correctAnswers)
            const correctAnswers = finalResponses.reduce((count, response) => {
                return count + (Boolean(response.isCorrect) ? 1 : 0);
            }, 0);

            // Score = correct answers / total questions (unanswered count as incorrect)
            const scorePercentage = totalQuestions > 0
                ? Math.max(0, Math.min(UI.MAX_PERCENTAGE, (correctAnswers / totalQuestions) * UI.MAX_PERCENTAGE))
                : 0;

            const resultsData = {
                score: Number(scorePercentage.toFixed(1)),
                totalQuestions,
                correctAnswers,
                remainingDailyPoints: 0, // Mock for now or fetch
                pointsEarned: correctAnswers * 1000, // Simplified
                pointsBreakdown: {},
                hasPassed: selectedQuiz.passingScore ? scorePercentage >= selectedQuiz.passingScore : true,
                isPerfectScore: scorePercentage === 100,
                hasPassingRequirement: !!selectedQuiz.passingScore,
                passingScore: selectedQuiz.passingScore || 0,
                timeSpent: selectedQuiz?.timeLimit ? (selectedQuiz.timeLimit * 60) - timeRemaining : 0,
                detailedResponses: finalResponses
            };

            // Save to store
            await setQuizResponses(resultsData);
            sessionStorage.setItem('lastQuizResults', JSON.stringify(resultsData));
            // Clear progress as the quiz is finished
            sessionStorage.removeItem('quizProgress');

            // API Call
            try {
                const response = await api.post("/user/quiz/finish", {
                    categoryId: selectedQuiz.categoryId,
                    quizId: selectedQuiz.id,
                    score: scorePercentage,
                    responses: finalResponses,
                    timeSpent: resultsData.timeSpent,
                    hasPassed: resultsData.hasPassed,
                    isPerfectScore: resultsData.isPerfectScore,
                    pointsBreakdown: {}
                });

                // Update results with actual points awarded from API
                // API returns { success: true, data: { pointsAwarded, bonusAwarded, ... } }
                const finishData = response.data?.data || response.data;
                if (finishData?.pointsAwarded !== undefined) {
                    resultsData.pointsEarned = finishData.pointsAwarded + (finishData.bonusAwarded || 0);
                    resultsData.pointsAwarded = finishData.pointsAwarded;
                    resultsData.bonusAwarded = finishData.bonusAwarded || 0;

                    // Fetch updated daily status for remaining points
                    try {
                        const dailyStatusResponse = await api.get("/user/points/daily-status");
                        // API returns { success: true, data: {...} }
                        const dailyData = dailyStatusResponse.data?.data || dailyStatusResponse.data;
                        if (dailyData) {
                            resultsData.remainingDailyPoints = Math.max(0,
                                dailyData.dailyLimit - dailyData.todaysPoints
                            );
                        }
                    } catch (dailyError) {
                        console.warn("Could not fetch daily status:", dailyError);
                    }

                    // Update stored results
                    await setQuizResponses(resultsData);
                    sessionStorage.setItem('lastQuizResults', JSON.stringify(resultsData));
                }
            } catch (e) {
                handleErrorWithNotification(e, "Failed to save quiz results");
                toast.warning("Quiz results saved locally only");
            }

            router.replace("/quiz/results");

        } catch (error) {
            handleErrorWithNotification(error, "Error completing quiz");
            setIsLoading(false);
        }
    }, [shuffledQuestionsMemo, selectedQuiz, timeRemaining, router, setQuizResponses]);


    // Timer Logic
    useEffect(() => {
        if (timeRemaining > 0 && !isLoading) {
            const timer = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        // Call handleFinishQuiz with latest ref values
                        handleFinishQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeRemaining, isLoading, handleFinishQuiz]);


    const toggleOption = useCallback((option) => {
        setSelectedOptions(prev => {
            const isSelected = prev.includes(option.id);
            let newSelection;
            if (isSelected) {
                newSelection = prev.filter(id => id !== option.id);
            } else {
                // Check if we should enforce single select behavior logic if needed, 
                // but design suggests multi-select "Select all that apply".
                // If the user wants single select, we might need to know question type.
                // Assuming multi-select for now based on design.
                newSelection = [...prev, option.id];
            }
            return newSelection;
        });
    }, []);

    // Save partial response whenever selection changes (or when navigating)
    // We'll save to 'responses' state only on navigation or when explicit save needed?
    // Actually easier to update 'responses' state on navigation to keep it clean, 
    // or sync 'selectedOptions' to 'responses' constantly.
    // Let's sync on navigation to avoid excessive re-renders/logic, 
    // BUT we need 'responses' to survive navigation.

    const saveCurrentResponse = useCallback(() => {
        if (!shuffledQuestionsMemo[currentIndex]) return;

        const currentQuestion = shuffledQuestionsMemo[currentIndex];
        const correctOptions = currentQuestion.options.filter(opt => opt.isCorrect);
        const correctOptionIds = correctOptions.map(opt => opt.id);

        // Determine correctness: All selected must be correct AND all correct must be selected
        // Or simplified: selected IDs must equal correct IDs set.
        const isCorrect =
            selectedOptions.length === correctOptionIds.length &&
            selectedOptions.every(id => correctOptionIds.includes(id));

        const response = {
            questionId: currentQuestion.id,
            selectedOptionIds: selectedOptions,
            isCorrect: isCorrect,
            question: currentQuestion.text,
            // For legacy support / display, we might want text. Join if multiple.
            selectedAnswer: currentQuestion.options.filter(opt => selectedOptions.includes(opt.id)).map(o => o.text).join(", "),
            correctAnswer: correctOptions.map(o => o.text).join(", ")
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

    }, [currentIndex, shuffledQuestionsMemo, selectedOptions]);


    const handlePrevQuestion = async () => {
        saveCurrentResponse(); // Save current before moving
        if (currentIndex > 0) {
            setIsTransitioning(true);
            await new Promise(resolve => setTimeout(resolve, 200));
            setCurrentIndex(prev => prev - 1);
            setIsTransitioning(false);
        }
    };

    const handleNextQuestion = async () => {
        saveCurrentResponse(); // Save current before moving
        if (currentIndex < shuffledQuestionsMemo.length - 1) {
            setIsTransitioning(true);
            await new Promise(resolve => setTimeout(resolve, 200));
            setCurrentIndex(prev => prev + 1);
            setIsTransitioning(false);
        } else {
            // Finish
            handleFinishQuiz();
        }
    };

    const handleSaveAndExit = () => {
        saveCurrentResponse();
        // Logic to save partial progress and exit? 
        // Current implementation saves progress to sessionStorage automatically.
        // Maybe just redirect to listing?
        router.push("/training");
    };


    // Effect to save progress to session storage
    useEffect(() => {
        if (!isLoading && selectedQuiz) {
            sessionStorage.setItem('quizProgress', JSON.stringify({
                quizId: selectedQuiz.id,
                currentIndex,
                responses
            }));
        }
    }, [currentIndex, responses, isLoading, selectedQuiz]);


    if (isLoading) return <Loader />;

    const currentQuestion = shuffledQuestionsMemo[currentIndex];
    // Calculate specific progress
    const progressPercentage = ((currentIndex + 1) / shuffledQuestionsMemo.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Left: Quiz Info */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">{selectedQuiz?.title}</h1>
                            <p className="text-sm text-muted-foreground">{selectedQuiz?.description || "Assessment"}</p>
                        </div>
                    </div>

                    {/* Center: Progress */}
                    <div className="flex-1 w-full md:max-w-xl flex flex-col gap-2">
                        <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            <span>Question {currentIndex + 1} of {shuffledQuestionsMemo.length}</span>
                            <span>{Math.round(progressPercentage)}% completed</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                    </div>

                    {/* Right: Timer & Exit */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        {selectedQuiz?.timeLimit && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-200 font-mono text-sm font-medium">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>{formatTime(timeRemaining)}</span>
                            </div>
                        )}
                        <Button variant="ghost" className="hidden md:flex items-center gap-2 text-gray-500 hover:text-red-500" onClick={handleSaveAndExit}>
                            <X className="w-5 h-5" />
                            Save & Exit
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 flex flex-col">
                <div className={`transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    {/* Question Section */}
                    {currentQuestion && (
                        <>
                            <div className="mb-2">
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                    Multiple Choice
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                                {currentQuestion.text}
                            </h2>
                            <p className="text-gray-500 mb-8">Select all that apply.</p>

                            <QuestionMedia question={currentQuestion} />

                            {/* Options */}
                            <div className="space-y-4">
                                {shuffledOptions.map((option) => {
                                    const isSelected = selectedOptions.includes(option.id);
                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() => !isTransitioning && toggleOption(option)}
                                            className={cn(
                                                "group relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                                                isSelected
                                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex items-center justify-center w-6 h-6 rounded border-2 mr-4 transition-colors",
                                                isSelected
                                                    ? "bg-blue-500 border-blue-500 text-white"
                                                    : "border-gray-300 bg-white group-hover:border-gray-400"
                                            )}>
                                                {isSelected && <Check className="w-4 h-4" />}
                                            </div>
                                            <span className={cn(
                                                "text-lg font-medium",
                                                isSelected ? "text-blue-900" : "text-gray-700"
                                            )}>
                                                {option.text}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t p-6 sticky bottom-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={handlePrevQuestion}
                        disabled={currentIndex === 0 || isTransitioning}
                        className="px-6 py-6 text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Previous
                    </Button>

                    <div className="hidden md:block text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Auto-saved
                    </div>

                    <Button
                        onClick={handleNextQuestion}
                        disabled={selectedOptions.length === 0 || isTransitioning}
                        className="px-8 py-6 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                    >
                        {currentIndex === shuffledQuestionsMemo.length - 1 ? "Finish Quiz" : "Next Question"}
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </footer>
        </div>
    )
}