"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading"
import { Plus, Minus, X, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import api from "@/utils/axios"
import { handleErrorWithNotification } from "@/utils/notifications"
import { QUIZ_CONFIG } from "@/constants"

export default function QuizBuilder({ quizId = null }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState([])
    const [quiz, setQuiz] = useState({
        title: "",
        description: "",
        imageUrl: "",
        categoryId: "",
        timeLimit: 0,
        passingScore: QUIZ_CONFIG.DEFAULT_PASSING_SCORE, // Default, will be updated from settings if available
        isActive: true,
        questions: Array(QUIZ_CONFIG.DEFAULT_QUESTIONS_COUNT).fill(null).map((_, i) => ({
            text: "",
            imageUrl: "",
            videoUrl: "",
            points: 1,
            options: Array(4).fill(null).map((_, j) => ({
                text: "",
                isCorrect: j === 0 // First option is default correct
            }))
        }))
    })

    useEffect(() => {
        fetchCategories()
        fetchQuizSettings()
        if (quizId) {
            fetchQuiz()
        } else {
            setLoading(false)
        }
    }, [quizId])

    const fetchCategories = async () => {
        try {
            const response = await api.get("/admin/categories")
            setCategories(response.data)
        } catch (error) {
            handleErrorWithNotification(error, "Failed to load categories")
        }
    }

    const fetchQuizSettings = async () => {
        try {
            const response = await api.get("/quiz/settings")
            const settings = response.data?.data?.quizSettings || response.data?.quizSettings
            if (settings?.passingScoreDefault) {
                // Only update if creating a new quiz (no quizId) or if passingScore is still the default
                setQuiz(prev => {
                    // If editing an existing quiz, keep the existing value; otherwise use settings
                    if (quizId) {
                        return prev; // Don't override when editing
                    }
                    return {
                        ...prev,
                        passingScore: settings.passingScoreDefault
                    }
                })
            }
        } catch (error) {
            // Settings fetch failure is not critical - use default values
            // Only log for debugging
            if (process.env.NODE_ENV === "development") {
                console.error("Failed to fetch quiz settings:", error)
            }
        }
    }

    const fetchQuiz = async () => {
        try {
            const response = await api.get(`/admin/quizzes/${quizId}`)
            setQuiz(response.data)
        } catch (error) {
            handleErrorWithNotification(error, "Failed to load quiz")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            // Validate basic quiz info
            if (!quiz.title.trim()) {
                toast.error("Quiz title is required")
                return
            }

            if (!quiz.categoryId) {
                toast.error("Quiz category is required")
                return
            }

            if (quiz.passingScore < 0 || quiz.passingScore > 100) {
                toast.error("Passing score must be between 0 and 100")
                return
            }

            if (quiz.timeLimit < 0) {
                toast.error("Time limit cannot be negative")
                return
            }

            if (quiz.questions.length < 1) {
                toast.error("Quiz must have at least one question")
                return
            }

            // Validate each question and its options
            for (const [qIndex, question] of quiz.questions.entries()) {
                if (!question.text.trim()) {
                    toast.error(`Question ${qIndex + 1} must have text`)
                    return
                }

                // Validate that both imageUrl and videoUrl cannot be set
                if (question.imageUrl && question.videoUrl) {
                    toast.error(`Question ${qIndex + 1} cannot have both image and video. Please use only one.`)
                    return
                }

                if (question.options.length < 2) {
                    toast.error(`Question ${qIndex + 1} must have at least 2 options`)
                    return
                }

                // Check for duplicate options
                const optionTexts = question.options.map(opt => opt.text.trim().toLowerCase())
                const uniqueOptions = new Set(optionTexts)
                if (uniqueOptions.size !== optionTexts.length) {
                    toast.error(`Question ${qIndex + 1} has duplicate options`)
                    return
                }

                const hasCorrectOption = question.options.some(opt => opt.isCorrect)
                if (!hasCorrectOption) {
                    toast.error(`Question ${qIndex + 1} must have at least one correct answer`)
                    return
                }

                // Validate each option
                for (const [oIndex, option] of question.options.entries()) {
                    if (!option.text.trim()) {
                        toast.error(`Option ${oIndex + 1} in Question ${qIndex + 1} must have text`)
                        return
                    }
                }
            }

            // Save the quiz
            if (quizId) {
                await api.put(`/admin/quizzes/${quizId}`, quiz)
                toast.success("Quiz updated successfully")
            } else {
                await api.post("/admin/quizzes", quiz)
                toast.success("Quiz created successfully")
            }

            router.push("/dashboard/quizzes")
        } catch (error) {
            handleErrorWithNotification(error, "Failed to save quiz")
        } finally {
            setSaving(false)
        }
    }

    const handleAddQuestion = () => {
        if (quiz.questions.length >= 10) {
            toast.error("Maximum 10 questions allowed per quiz")
            return
        }

        setQuiz(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    text: "",
                    imageUrl: "",
                    videoUrl: "",
                    points: 1,
                    options: Array(4).fill(null).map(() => ({
                        text: "",
                        isCorrect: false
                    }))
                }
            ]
        }))
    }

    const handleRemoveQuestion = (index) => {
        if (quiz.questions.length <= 1) {
            toast.error("Quiz must have at least one question")
            return
        }
        setQuiz(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }))
        toast.info(`Question ${index + 1} removed`)
    }

    const handleQuestionChange = (index, field, value) => {
        setQuiz(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => {
                if (i !== index) return q;

                // If setting imageUrl, clear videoUrl
                if (field === "imageUrl" && value) {
                    return { ...q, imageUrl: value, videoUrl: "" };
                }
                // If setting videoUrl, clear imageUrl
                if (field === "videoUrl" && value) {
                    return { ...q, videoUrl: value, imageUrl: "" };
                }
                // Otherwise, just update the field
                return { ...q, [field]: value };
            })
        }))
    }

    const handleAddOption = (questionIndex) => {
        const question = quiz.questions[questionIndex]
        if (question.options.length >= 6) {
            toast.error("Maximum 6 options allowed per question")
            return
        }

        setQuiz(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === questionIndex ? {
                    ...q,
                    options: [
                        ...q.options,
                        {
                            text: "",
                            isCorrect: false
                        }
                    ]
                } : q
            )
        }))
    }

    const handleRemoveOption = (questionIndex, optionIndex) => {
        const question = quiz.questions[questionIndex]
        if (question.options.length <= 2) {
            toast.error("Each question must have at least 2 options")
            return
        }

        // Don't allow removing the last correct option
        const option = question.options[optionIndex]
        const correctOptions = question.options.filter(o => o.isCorrect)
        if (option.isCorrect && correctOptions.length === 1) {
            toast.error("Each question must have at least one correct answer")
            return
        }

        setQuiz(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === questionIndex ? {
                    ...q,
                    options: q.options.filter((_, j) => j !== optionIndex)
                } : q
            )
        }))
    }

    const handleOptionChange = (questionIndex, optionIndex, field, value) => {
        if (field === "isCorrect" && !value) {
            // Check if this is the last correct option
            const question = quiz.questions[questionIndex]
            const correctOptions = question.options.filter(o => o.isCorrect)
            if (correctOptions.length === 1 && correctOptions[0] === question.options[optionIndex]) {
                toast.error("Each question must have at least one correct answer")
                return
            }
        }

        setQuiz(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === questionIndex ? {
                    ...q,
                    options: q.options.map((opt, j) =>
                        j === optionIndex ? { ...opt, [field]: value } : opt
                    )
                } : q
            )
        }))
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard/quizzes")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Quizzes
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Quiz Details Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{quizId ? "Edit Quiz" : "Create Quiz"}</CardTitle>
                        <CardDescription>Enter the quiz details below</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    required
                                    value={quiz.title}
                                    onChange={e => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={quiz.categoryId}
                                    onValueChange={value => setQuiz(prev => ({ ...prev, categoryId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(category => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={quiz.description || ""}
                                onChange={e => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                            />
                        </div>

                        {/* Quiz Settings */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                                <Input
                                    id="timeLimit"
                                    type="number"
                                    min="0"
                                    value={quiz.timeLimit || ""}
                                    onChange={e => setQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || null }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="passingScore">Passing Score (%)</Label>
                                <Input
                                    id="passingScore"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={quiz.passingScore}
                                    onChange={e => setQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))
                                    }
                                />
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={quiz.isActive}
                                onCheckedChange={checked => setQuiz(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions Section */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">Questions ({quiz.questions.length})</h3>
                            <p className="text-sm text-muted-foreground">Add at least one question to your quiz</p>
                        </div>
                        <Button
                            type="button"
                            onClick={handleAddQuestion}
                            className="space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Question</span>
                        </Button>
                    </div>

                    {quiz.questions.map((question, qIndex) => (
                        <Card key={qIndex} className="relative border-2">
                            {/* Delete Question Button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute -top-2 -right-2 bg-white rounded-full hover:bg-red-50 text-red-500 border-2"
                                onClick={() => handleRemoveQuestion(qIndex)}
                            >
                                <X className="w-4 h-4" />
                            </Button>

                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-md">
                                        Question {qIndex + 1}
                                    </span>
                                    {!question.text.trim() && (
                                        <span className="text-red-500 text-sm font-normal">
                                            Question text required
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Question Text */}
                                <div className="space-y-2">
                                    <Label>Question Text *</Label>
                                    <Textarea
                                        value={question.text}
                                        onChange={e => handleQuestionChange(qIndex, "text", e.target.value)}
                                        rows={2}
                                        placeholder="Enter your question here..."
                                    />
                                </div>

                                {/* Question Settings */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Image URL</Label>
                                        <Input
                                            value={question.imageUrl || ""}
                                            onChange={e => handleQuestionChange(qIndex, "imageUrl", e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            disabled={!!question.videoUrl}
                                        />
                                        {question.videoUrl && (
                                            <p className="text-xs text-muted-foreground">Clear video URL to add image</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Video URL</Label>
                                        <Input
                                            value={question.videoUrl || ""}
                                            onChange={e => handleQuestionChange(qIndex, "videoUrl", e.target.value)}
                                            placeholder="https://example.com/video.mp4"
                                            disabled={!!question.imageUrl}
                                        />
                                        {question.imageUrl && (
                                            <p className="text-xs text-muted-foreground">Clear image URL to add video</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Points</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={question.points}
                                            onChange={e => handleQuestionChange(qIndex, "points", parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <Label className="block">Options ({question.options.length})</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Mark at least one option as correct
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddOption(qIndex)}
                                            className="space-x-1"
                                        >
                                            <Plus className="w-3 h-3" />
                                            <span>Add Option</span>
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {question.options.map((option, oIndex) => (
                                            <div
                                                key={oIndex}
                                                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${option.isCorrect ? 'bg-green-50' : ''
                                                    }`}
                                            >
                                                <Input
                                                    value={option.text}
                                                    onChange={e => handleOptionChange(qIndex, oIndex, "text", e.target.value)}
                                                    placeholder={`Enter option ${oIndex + 1}...`}
                                                    className={`flex-1 ${!option.text.trim() ? 'border-red-500' : ''}`}
                                                />
                                                <div className="flex items-center gap-2 min-w-[140px]">
                                                    <Switch
                                                        checked={option.isCorrect}
                                                        onCheckedChange={checked => handleOptionChange(qIndex, oIndex, "isCorrect", checked)}
                                                    />
                                                    <Label className={`text-sm ${option.isCorrect ? 'text-green-600' : ''}`}>
                                                        Correct
                                                    </Label>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveOption(qIndex, oIndex)}
                                                    className="hover:text-red-500"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    {question.options.length < 2 && (
                                        <p className="text-red-500 text-sm">
                                            Add at least two options
                                        </p>
                                    )}

                                    {!question.options.some(opt => opt.isCorrect) && (
                                        <p className="text-red-500 text-sm">
                                            Mark at least one option as correct
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Form Actions */}
                <div className="mt-6 flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard/quizzes")}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? (
                            <>
                                <LoadingSpinner className="w-4 h-4 mr-2" />
                                {quizId ? "Updating..." : "Creating..."}
                            </>
                        ) : (
                            quizId ? "Update Quiz" : "Create Quiz"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
