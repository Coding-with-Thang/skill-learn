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

          {/* Quiz Image */}
          <div className="space-y-2">
            <Label>Quiz Image</Label>
            <Uploader
              uploadEndpoint="/api/admin/quizzes/upload"
              value={quiz.imageUrl || ""}
              onChange={(url) => setQuiz(prev => ({ ...prev, imageUrl: url || "" }))}
              onUploadComplete={(upload) => {
                // upload: { url, path }
                // store storage path as fileKey for database
                if (upload?.path) {
                  setQuiz(prev => ({ ...prev, fileKey: upload.path }))
                }
              }}
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
                onChange={e => setQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
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

          {/* Review Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 border p-4 rounded-lg">
              <Switch
                id="showQuestionReview"
                checked={quiz.showQuestionReview}
                onCheckedChange={checked => setQuiz(prev => ({ ...prev, showQuestionReview: checked }))}
              />
              <div className="space-y-1">
                <Label htmlFor="showQuestionReview">Show Question Review</Label>
                <p className="text-xs text-muted-foreground">
                  Allow users to review questions after quiz
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 border p-4 rounded-lg">
              <Switch
                id="showCorrectAnswers"
                checked={quiz.showCorrectAnswers}
                disabled={!quiz.showQuestionReview}
                onCheckedChange={checked => setQuiz(prev => ({ ...prev, showCorrectAnswers: checked }))}
              />
              <div className="space-y-1">
                <Label htmlFor="showCorrectAnswers">Show Correct Answers</Label>
                <p className="text-xs text-muted-foreground">
                  Display correct answers for incorrect attempts
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Questions ({quiz.questions?.length || 0})</h3>
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

        {(quiz.questions || []).map((question, qIndex) => (
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
                <div className="space-y-2 col-span-2">
                  <Label>Question Image</Label>
                  {question.videoUrl ? (
                    <div className="text-xs text-muted-foreground p-2 border rounded">
                      Clear video URL to add image
                    </div>
                  ) : (
                    <Uploader
                      uploadEndpoint="/api/admin/questions/upload"
                      value={question.imageUrl || ""}
                      onChange={(url) => handleQuestionChange(qIndex, "imageUrl", url || "")}
                      onUploadComplete={(upload) => {
                        // upload: { url, path }
                        // store storage path as fileKey for database
                        if (upload?.path) {
                          handleQuestionChange(qIndex, "fileKey", upload.path);
                        }
                      }}
                    />
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
        </div >
    )
}
