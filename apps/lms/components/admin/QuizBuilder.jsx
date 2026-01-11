"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@skill-learn/ui/components/card"
import { Button } from "@skill-learn/ui/components/button"
import { Input } from "@skill-learn/ui/components/input"
import { Textarea } from "@skill-learn/ui/components/textarea"
import { Switch } from "@skill-learn/ui/components/switch"
import { Label } from "@skill-learn/ui/components/label"
import { LoadingSpinner } from "@skill-learn/ui/components/loading"
import { Plus, Minus, X, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import api from "@skill-learn/lib/utils/axios.js"
import { handleErrorWithNotification } from "@/lib/utils/notifications"
import { QUIZ_CONFIG } from "@/config/constants"
import { Uploader } from "@/components/file-uploader/Uploader"
import { quizCreateSchema, quizUpdateSchema } from "@/lib/zodSchemas"
import {
  Form,
  FormInput,
  FormSelect,
  FormTextarea,
  FormSwitch,
} from "@skill-learn/ui/components/form-components"

export default function QuizBuilder({ quizId = null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    imageUrl: "",
    fileKey: "",
    categoryId: "",
    timeLimit: 0,
    passingScore: QUIZ_CONFIG.DEFAULT_PASSING_SCORE, // Default, will be updated from settings if available
    isActive: true,
    showQuestionReview: true,
    showCorrectAnswers: false,
    questions: Array(QUIZ_CONFIG.DEFAULT_QUESTIONS_COUNT).fill(null).map((_, i) => ({
      text: "",
      imageUrl: "",
      fileKey: "",
      videoUrl: "",
      points: 1,
      options: Array(4).fill(null).map((_, j) => ({
        text: "",
        isCorrect: j === 0 // First option is default correct
      }))
    }))
  })

  const schema = quizId ? quizUpdateSchema : quizCreateSchema
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      categoryId: "",
      timeLimit: 0,
      passingScore: QUIZ_CONFIG.DEFAULT_PASSING_SCORE,
      isActive: true,
      showQuestionReview: true,
      showCorrectAnswers: false,
      questions: Array(QUIZ_CONFIG.DEFAULT_QUESTIONS_COUNT)
        .fill(null)
        .map(() => ({
          text: "",
          imageUrl: "",
          videoUrl: "",
          points: 1,
          options: Array(4)
            .fill(null)
            .map((_, j) => ({
              text: "",
              isCorrect: j === 0, // First option is default correct
            })),
        })),
    },
  })

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control: form.control,
    name: "questions",
  })

  const watchedShowQuestionReview = form.watch("showQuestionReview")

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
      const responseData = response.data?.data || response.data
      const categoriesArray = responseData?.categories || responseData || []
      setCategories(Array.isArray(categoriesArray) ? categoriesArray : [])
    } catch (error) {
      handleErrorWithNotification(error, "Failed to load categories")
      setCategories([])
    }
  }

  const fetchQuizSettings = async () => {
    try {
      const response = await api.get("/quiz/settings")
      const settings = response.data?.data?.quizSettings || response.data?.quizSettings
      if (settings?.passingScoreDefault) {
        setQuiz(prev => ({
          ...prev,
          passingScore: settings.passingScoreDefault
        }))
        form.setValue("passingScore", settings.passingScoreDefault)
      }
    } catch (error) {
      // Silently fail - use defaults
      console.warn("Failed to load quiz settings:", error)
    }
  }

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/admin/quizzes/${quizId}`)
      const quizData = response.data?.data || response.data
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        quizData.questions = []
      }
      form.reset({
        title: quizData.title || "",
        description: quizData.description || "",
        imageUrl: quizData.imageUrl || "",
        categoryId: quizData.categoryId || "",
        timeLimit: quizData.timeLimit || 0,
        passingScore: quizData.passingScore || QUIZ_CONFIG.DEFAULT_PASSING_SCORE,
        isActive: quizData.isActive ?? true,
        showQuestionReview: quizData.showQuestionReview ?? true,
        showCorrectAnswers: quizData.showCorrectAnswers ?? false,
        questions: quizData.questions.map((q) => ({
          text: q.text || "",
          imageUrl: q.imageUrl || "",
          videoUrl: q.videoUrl || "",
          points: q.points || 1,
          options: (q.options || []).map((opt) => ({
            text: opt.text || "",
            isCorrect: opt.isCorrect || false,
          })),
        })),
      })
      // Also update the state for backwards compatibility
      setQuiz(prev => ({
        ...prev,
        title: quizData.title || "",
        description: quizData.description || "",
        imageUrl: quizData.imageUrl || "",
        fileKey: quizData.fileKey || "",
        categoryId: quizData.categoryId || "",
        timeLimit: quizData.timeLimit || 0,
        passingScore: quizData.passingScore || QUIZ_CONFIG.DEFAULT_PASSING_SCORE,
        isActive: quizData.isActive ?? true,
        showQuestionReview: quizData.showQuestionReview ?? true,
        showCorrectAnswers: quizData.showCorrectAnswers ?? false,
      }))
    } catch (error) {
      handleErrorWithNotification(error, "Failed to load quiz")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      // Validate questions
      if (!data.questions || data.questions.length < 1) {
        toast.error("Quiz must have at least one question")
        setSaving(false)
        return
      }

      // Validate each question
      for (const [qIndex, question] of data.questions.entries()) {
        if (!question.text.trim()) {
          toast.error(`Question ${qIndex + 1} must have text`)
          setSaving(false)
          return
        }

        if (!question.options || question.options.length < 2) {
          toast.error(`Question ${qIndex + 1} must have at least 2 options`)
          setSaving(false)
          return
        }

        const hasCorrectOption = question.options.some((opt) => opt.isCorrect)
        if (!hasCorrectOption) {
          toast.error(
            `Question ${qIndex + 1} must have at least one correct answer`
          )
          setSaving(false)
          return
        }

        for (const [oIndex, option] of question.options.entries()) {
          if (!option.text.trim()) {
            toast.error(
              `Option ${oIndex + 1} in Question ${qIndex + 1} must have text`
            )
            setSaving(false)
            return
          }
        }
      }

      // Save the quiz
      if (quizId) {
        await api.put(`/admin/quizzes/${quizId}`, data)
        toast.success("Quiz updated successfully")
      } else {
        await api.post("/admin/quizzes", data)
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
    if (questionFields.length >= 10) {
      toast.error("Maximum 10 questions allowed per quiz")
      return
    }
    appendQuestion({
      text: "",
      imageUrl: "",
      videoUrl: "",
      points: 1,
      options: Array(4)
        .fill(null)
        .map(() => ({
          text: "",
          isCorrect: false,
        })),
    })
  }

  const handleRemoveQuestion = (index) => {
    if (questionFields.length <= 1) {
      toast.error("Quiz must have at least one question")
      return
    }
    removeQuestion(index)
    toast.info(`Question ${index + 1} removed`)
  }

  const handleQuestionChange = (index, field, value) => {
    setQuiz(prev => ({
      ...prev,
      questions: (prev.questions || []).map((q, i) => {
        if (i !== index) return q;

        // If setting imageUrl, clear videoUrl and fileKey
        if (field === "imageUrl" && value) {
          return { ...q, imageUrl: value, videoUrl: "", fileKey: "" };
        }
        // If setting videoUrl, clear imageUrl and fileKey
        if (field === "videoUrl" && value) {
          return { ...q, videoUrl: value, imageUrl: "", fileKey: "" };
        }
        // If setting fileKey, ensure imageUrl is set (from upload)
        if (field === "fileKey") {
          return { ...q, fileKey: value };
        }
        // Otherwise, just update the field
        return { ...q, [field]: value };
      })
    }))
  }

  const handleAddOption = (questionIndex) => {
    const questions = quiz.questions || []
    const question = questions[questionIndex]
    if (!question) return

    if (!question.options || question.options.length >= 6) {
      toast.error("Maximum 6 options allowed per question")
      return
    }

    setQuiz(prev => ({
      ...prev,
      questions: (prev.questions || []).map((q, i) => {
        if (i !== questionIndex) return q
        return {
          ...q,
          options: [...(q.options || []), { text: "", isCorrect: false }]
        }
      })
    }))
  }

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const questions = quiz.questions || []
    const question = questions[questionIndex]
    if (!question || !question.options || question.options.length <= 2) {
      toast.error("Questions must have at least 2 options")
      return
    }

    setQuiz(prev => ({
      ...prev,
      questions: (prev.questions || []).map((q, i) => {
        if (i !== questionIndex) return q
        return {
          ...q,
          options: q.options.filter((_, oi) => oi !== optionIndex)
        }
      })
    }))
  }

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    setQuiz(prev => ({
      ...prev,
      questions: (prev.questions || []).map((q, i) => {
        if (i !== questionIndex) return q
        return {
          ...q,
          options: (q.options || []).map((opt, oi) => {
            if (oi !== optionIndex) return opt
            return { ...opt, [field]: value }
          })
        }
      })
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Quiz Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{quizId ? "Edit Quiz" : "Create Quiz"}</CardTitle>
              <CardDescription>Enter the quiz details below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <FormInput name="title" label="Title" placeholder="Enter quiz title" required />
                <FormSelect
                  name="categoryId"
                  label="Category"
                  placeholder="Select a category"
                  options={categoryOptions}
                  required
                />
              </div>

              {/* Description */}
              <FormTextarea
                name="description"
                label="Description"
                placeholder="Enter quiz description"
                rows={3}
              />

              {/* Quiz Settings */}
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  name="timeLimit"
                  label="Time Limit (minutes)"
                  type="number"
                  min="0"
                  placeholder="0"
                />
                <FormInput
                  name="passingScore"
                  label="Passing Score (%)"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="70"
                />
              </div>

              {/* Active Status */}
              <FormSwitch
                name="isActive"
                label="Active"
                description="Make this quiz available for users"
              />

              {/* Review Settings */}
              <div className="grid grid-cols-2 gap-4">
                <FormSwitch
                  name="showQuestionReview"
                  label="Show Question Review"
                  description="Allow users to review questions after quiz"
                />
                <FormSwitch
                  name="showCorrectAnswers"
                  label="Show Correct Answers"
                  description="Display correct answers for incorrect attempts"
                  disabled={!watchedShowQuestionReview}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  Questions ({questionFields.length})
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add at least one question to your quiz
                </p>
              </div>
              <Button type="button" onClick={handleAddQuestion} className="space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </Button>
            </div>

            {questionFields.map((question, qIndex) => (
              <Card key={question.id} className="relative border-2 mb-4">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">
                      Question {qIndex + 1}
                    </CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Question editing will be implemented here. Currently using state-based implementation below.
                  </p>
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
      </Form>
    </div>
    )
}
