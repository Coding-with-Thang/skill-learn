"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from "@/i18n/navigation"
import { useQuizStartStore } from "@skill-learn/lib/stores/quizStore"
import api from "@skill-learn/lib/utils/axios";
import { Button } from "@skill-learn/ui/components/button"
import { FeatureGate, FeatureDisabledPage } from "@skill-learn/ui/components/feature-gate"
import { Clock, X, ChevronLeft, ChevronRight, GraduationCap, Check } from 'lucide-react'
import { Loader } from "@skill-learn/ui/components/loader"
import Image from "next/image"
import { toast } from "sonner"
import { cn } from "@skill-learn/lib/utils"
import { Progress } from "@skill-learn/ui/components/progress"
import { UI, QUIZ_CONFIG } from "@/config/constants"
import { handleErrorWithNotification } from "@skill-learn/lib/utils/notifications"

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

type QuizQuestionResponse = { questionId: string; selectedOptionIds?: string[]; isCorrect?: boolean; question?: string; selectedAnswer?: string; correctAnswer?: string };

const QuestionMedia = ({ question }: { question: { imageUrl?: string; videoUrl?: string } }) => {
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
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 768px"
                    onError={() => setMediaError(true)}
                />
            </div>
        );
    }

    return null;
};

export default function QuizScreenPage() {
    const router = useRouter();
    const { selectedQuiz, setSelectedQuiz, setQuizResponses } = useQuizStartStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]); // Array of selected option IDs
    const [responses, setResponses] = useState<QuizQuestionResponse[]>([]);
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
    const shuffledQuestionsMemo = useMemo(() => {
        if (!selectedQuiz || !selectedQuiz.questions || !Array.isArray(selectedQuiz.questions)) {
            return [];
        }
        console.log("[Quiz Debug] Shuffling questions, first question structure:", {
            id: selectedQuiz.questions[0]?.id,
            hasText: !!selectedQuiz.questions[0]?.text,
            hasOptions: !!selectedQuiz.questions[0]?.options,
            keys: selectedQuiz.questions[0] ? Object.keys(selectedQuiz.questions[0]) : []
        });
        return shuffleArray(selectedQuiz.questions);
    }, [selectedQuiz]);

    // Memoize shuffled options for current question
    const shuffledOptions = useMemo(() =>
        shuffledQuestionsMemo[currentIndex]?.options
            ? shuffleArray(shuffledQuestionsMemo[currentIndex].options)
            : [],
        [shuffledQuestionsMemo, currentIndex]
    );

    // Fetch quiz data if missing or incomplete
    const fetchQuizData = useCallback(async (quizId) => {
        try {
            console.log("[Quiz Debug] Fetching quiz data for ID:", quizId);
            const response = await api.get(`/user/quiz/${quizId}`);
            const quizData = response.data?.data?.quiz || response.data?.quiz;

            if (quizData) {
                console.log("[Quiz Debug] Fetched quiz data:", {
                    id: quizData.id,
                    title: quizData.title,
                    questionsCount: quizData.questions?.length || 0,
                    hasQuestions: !!quizData.questions && Array.isArray(quizData.questions) && quizData.questions.length > 0,
                    firstQuestion: quizData.questions?.[0] ? {
                        id: quizData.questions[0].id,
                        hasText: !!quizData.questions[0].text,
                        text: quizData.questions[0].text?.substring(0, 50),
                        hasOptions: !!quizData.questions[0].options,
                        optionsCount: quizData.questions[0].options?.length || 0
                    } : null
                });
                setSelectedQuiz(quizData);
                return quizData;
            }
            return null;
        } catch (error) {
            console.error("[Quiz Debug] Error fetching quiz data:", error);
            handleErrorWithNotification(error, "Failed to load quiz data");
            return null;
        }
    }, [setSelectedQuiz]);

    // Load saved state from session storage on mount
    useEffect(() => {
        const initializeQuiz = async () => {
            console.log("[Quiz Debug] Initializing quiz, selectedQuiz:", {
                exists: !!selectedQuiz,
                id: selectedQuiz?.id,
                title: selectedQuiz?.title,
                hasQuestions: !!selectedQuiz?.questions,
                questionsCount: selectedQuiz?.questions?.length || 0,
                questionsType: Array.isArray(selectedQuiz?.questions) ? 'array' : typeof selectedQuiz?.questions,
                firstQuestionSample: selectedQuiz?.questions?.[0] ? {
                    id: selectedQuiz.questions[0].id,
                    hasText: !!selectedQuiz.questions[0].text,
                    text: selectedQuiz.questions[0].text,
                    hasOptions: !!selectedQuiz.questions[0].options,
                    optionsCount: selectedQuiz.questions[0].options?.length || 0,
                    keys: Object.keys(selectedQuiz.questions[0])
                } : null
            });

            let quiz = selectedQuiz;
            let quizId = quiz?.id;

            // Get quizId from saved progress if needed
            if (!quizId) {
                const savedProgress = sessionStorage.getItem('quizProgress');
                if (savedProgress) {
                    try {
                        const parsed = JSON.parse(savedProgress);
                        quizId = parsed.quizId;
                    } catch (e) {
                        console.error("[Quiz Debug] Error parsing saved progress:", e);
                    }
                }
            }

            // Always fetch from API to ensure we have complete data structure
            // The store data might be incomplete or stale
            if (quizId) {
                console.log("[Quiz Debug] Fetching quiz data from API for ID:", quizId);
                quiz = await fetchQuizData(quizId);
                if (!quiz) {
                    router.push("/training");
                    return;
                }
            } else {
                // Fallback: Use store data if no quizId available
                if (!quiz || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
                    console.log("[Quiz Debug] No quizId available and no valid quiz in store, redirecting to training");
                    router.push("/training");
                    return;
                }
            }

            if (!quiz) {
                console.log("[Quiz Debug] No quiz available, redirecting");
                router.push("/training");
                return;
            }

            // Final validation: Check if quiz has questions with proper structure
            if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
                console.error("[Quiz Debug] Quiz has no questions after fetch:", quiz);
                toast.error("This quiz has no questions available. Please select another quiz.");
                router.push("/training");
                return;
            }

            // Validate that questions have text and options
            const questionsAreValid = quiz.questions.every(q => q.text && q.options && Array.isArray(q.options));
            if (!questionsAreValid) {
                console.error("[Quiz Debug] Quiz questions are missing text or options:", quiz.questions);
                console.log("[Quiz Debug] Sample question structure:", quiz.questions[0]);
                toast.error("Quiz data is incomplete. Please try again.");
                router.push("/training");
                return;
            }

            console.log("[Quiz Debug] Quiz validated successfully, questions count:", quiz.questions.length);

            // Restore saved progress if available
            const savedProgress = sessionStorage.getItem('quizProgress');
            if (savedProgress) {
                try {
                    const { currentIndex: savedIndex, responses: savedResponses, quizId: savedQuizId } = JSON.parse(savedProgress);
                    // Validate quiz ID matches
                    if (savedQuizId === quiz.id) {
                        console.log("[Quiz Debug] Restoring saved progress, index:", savedIndex);
                        setCurrentIndex(savedIndex);
                        setResponses(savedResponses);

                        // Restore selection for current question if it exists in responses
                        const currentQuestionId = quiz.questions[savedIndex]?.id;
                        const existingResponse = savedResponses.find(r => r.questionId === currentQuestionId);
                        if (existingResponse) {
                            setSelectedOptions(existingResponse.selectedOptionIds || []);
                        }
                    }
                } catch (e) {
                    // Error loading saved progress - not critical, just continue
                    if (process.env.NODE_ENV === "development") {
                        console.error("[Quiz Debug] Error loading progress", e);
                    }
                }
            }
            setIsLoading(false);
        };

        initializeQuiz();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount - we'll handle selectedQuiz updates separately


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
                const ids = response.selectedOptionIds ?? [];
                const isCorrect =
                    ids.length === correctOptionIds.length &&
                    ids.every(id => correctOptionIds.includes(id));

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

            const resultsData: {
                score: number;
                totalQuestions: number;
                correctAnswers: number;
                remainingDailyPoints: number;
                pointsEarned: number;
                pointsAwarded?: number;
                bonusAwarded?: number;
                pointsBreakdown: Record<string, unknown>;
                hasPassed: boolean;
                isPerfectScore: boolean;
                hasPassingRequirement: boolean;
                passingScore: number;
                timeSpent: number;
                detailedResponses: QuizQuestionResponse[];
            } = {
                score: Number(scorePercentage.toFixed(1)),
                totalQuestions,
                correctAnswers,
                remainingDailyPoints: 0, // Mock for now or fetch
                pointsEarned: correctAnswers * QUIZ_CONFIG.POINTS_PER_CORRECT_ANSWER, // Points per correct answer
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

                    // Use dailyStatus from response (eliminates need for follow-up API call)
                    if (finishData.dailyStatus) {
                        resultsData.remainingDailyPoints = finishData.dailyStatus.remainingDailyPoints || Math.max(0,
                            finishData.dailyStatus.dailyLimit - finishData.dailyStatus.todaysPoints
                        );
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

    // Validate that we have questions
    if (!selectedQuiz || !selectedQuiz.questions || selectedQuiz.questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h1>
                    <p className="text-gray-600 mb-6">This quiz does not have any questions. Please select another quiz.</p>
                    <Button onClick={() => router.push("/training")} className="bg-blue-600 hover:bg-blue-700">
                        Go Back to Training
                    </Button>
                </div>
            </div>
        );
    }

    const currentQuestion = shuffledQuestionsMemo[currentIndex];

    // Validate current question exists
    if (!currentQuestion) {
        console.error("[Quiz Debug] Current question is undefined:", {
            currentIndex,
            shuffledQuestionsMemoLength: shuffledQuestionsMemo.length,
            shuffledQuestionsMemo: shuffledQuestionsMemo,
            selectedQuiz: selectedQuiz
        });
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h1>
                    <p className="text-gray-600 mb-6">Unable to load the current question. Please try again.</p>
                    <Button onClick={() => router.push("/training")} className="bg-blue-600 hover:bg-blue-700">
                        Go Back to Training
                    </Button>
                </div>
            </div>
        );
    }

    // Debug logging for current question
    console.log("[Quiz Debug] Current question data:", {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        hasText: !!currentQuestion.text,
        textLength: currentQuestion.text?.length || 0,
        optionsCount: currentQuestion.options?.length || 0,
        options: currentQuestion.options,
        shuffledOptionsCount: shuffledOptions.length
    });

    // Calculate specific progress
    const progressPercentage = ((currentIndex + 1) / shuffledQuestionsMemo.length) * 100;

    return (
        <FeatureGate
            feature="course_quizzes"
            featureName="Course Quizzes"
            fallback={<FeatureDisabledPage featureName="Course Quizzes" />}
        >
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
                                    {currentQuestion.text || "Question text not available"}
                                </h2>
                                <p className="text-gray-500 mb-8">Select all that apply.</p>

                                <QuestionMedia question={currentQuestion} />

                                {/* Options */}
                                <div className="space-y-4">
                                    {shuffledOptions && shuffledOptions.length > 0 ? (
                                        shuffledOptions.map((option) => {
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
                                        })
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
                                            <p className="text-lg font-medium">No options available for this question.</p>
                                            <p className="text-sm mt-2">Please contact support if this issue persists.</p>
                                        </div>
                                    )}
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
        </FeatureGate>
    )
}