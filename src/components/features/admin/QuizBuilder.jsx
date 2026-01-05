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
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading"
import { Plus, Minus, X, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/utils/axios"
import { handleErrorWithNotification } from "@/lib/utils/notifications"
import { QUIZ_CONFIG } from "@/config/constants"
import { Form } from "@/components/ui/form"
import { FormInput } from "@/components/ui/form-input"
import { FormTextarea } from "@/components/ui/form-textarea"
import { FormSelect } from "@/components/ui/form-select"
import { FormSwitch } from "@/components/ui/form-switch"
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { quizCreateSchema, quizUpdateSchema } from "@/lib/zodSchemas"

export default function QuizBuilder({ quizId = null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])

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
      const settings =
        response.data?.data?.quizSettings || response.data?.quizSettings
      if (settings?.passingScoreDefault && !quizId) {
        form.setValue("passingScore", settings.passingScoreDefault)
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch quiz settings:", error)
      }
    }
  }

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/admin/quizzes/${quizId}`)
      const quizData = response.data
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
    } catch (error) {
      handleErrorWithNotification(error, "Failed to load quiz")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      // Validate questions
      if (!data.questions || data.questions.length < 1) {
        toast.error("Quiz must have at least one question")
        return
      }

      // Validate each question
      for (const [qIndex, question] of data.questions.entries()) {
        if (!question.text.trim()) {
          toast.error(`Question ${qIndex + 1} must have text`)
          return
        }

        if (question.imageUrl && question.videoUrl) {
          toast.error(
            `Question ${qIndex + 1} cannot have both image and video. Please use only one.`
          )
          return
        }

        if (question.options.length < 2) {
          toast.error(`Question ${qIndex + 1} must have at least 2 options`)
          return
        }

        const optionTexts = question.options.map((opt) =>
          opt.text.trim().toLowerCase()
        )
        const uniqueOptions = new Set(optionTexts)
        if (uniqueOptions.size !== optionTexts.length) {
          toast.error(`Question ${qIndex + 1} has duplicate options`)
          return
        }

        const hasCorrectOption = question.options.some((opt) => opt.isCorrect)
        if (!hasCorrectOption) {
          toast.error(
            `Question ${qIndex + 1} must have at least one correct answer`
          )
          return
        }

        for (const [oIndex, option] of question.options.entries()) {
          if (!option.text.trim()) {
            toast.error(
              `Option ${oIndex + 1} in Question ${qIndex + 1} must have text`
            )
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
              <QuestionCard
                key={question.id}
                questionIndex={qIndex}
                form={form}
                onRemove={() => handleRemoveQuestion(qIndex)}
              />
            ))}
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/quizzes")}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
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

// Separate component for question card to manage nested options
function QuestionCard({ questionIndex, form, onRemove }) {
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.options`,
  })

  const watchedImageUrl = form.watch(
    `questions.${questionIndex}.imageUrl`
  )
  const watchedVideoUrl = form.watch(
    `questions.${questionIndex}.videoUrl`
  )
  const watchedOptions = form.watch(
    `questions.${questionIndex}.options`
  )

  const handleAddOption = () => {
    if (optionFields.length >= 6) {
      toast.error("Maximum 6 options allowed per question")
      return
    }
    appendOption({
      text: "",
      isCorrect: false,
    })
  }

  const handleRemoveOption = (optionIndex) => {
    if (optionFields.length <= 2) {
      toast.error("Each question must have at least 2 options")
      return
    }

    const option = watchedOptions[optionIndex]
    const correctOptions = watchedOptions.filter((o) => o.isCorrect)
    if (option.isCorrect && correctOptions.length === 1) {
      toast.error("Each question must have at least one correct answer")
      return
    }

    removeOption(optionIndex)
  }

  const handleImageUrlChange = (value) => {
    form.setValue(`questions.${questionIndex}.imageUrl`, value)
    if (value && watchedVideoUrl) {
      form.setValue(`questions.${questionIndex}.videoUrl`, "")
    }
  }

  const handleVideoUrlChange = (value) => {
    form.setValue(`questions.${questionIndex}.videoUrl`, value)
    if (value && watchedImageUrl) {
      form.setValue(`questions.${questionIndex}.imageUrl`, "")
    }
  }

  const handleOptionCorrectChange = (optionIndex, checked) => {
    if (!checked) {
      const correctOptions = watchedOptions.filter((o) => o.isCorrect)
      if (correctOptions.length === 1 && watchedOptions[optionIndex].isCorrect) {
        toast.error("Each question must have at least one correct answer")
        return
      }
    }
    form.setValue(
      `questions.${questionIndex}.options.${optionIndex}.isCorrect`,
      checked
    )
  }

  return (
    <Card className="relative border-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute -top-2 -right-2 bg-white rounded-full hover:bg-red-50 text-red-500 border-2"
        onClick={onRemove}
      >
        <X className="w-4 h-4" />
      </Button>

      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-md">
            Question {questionIndex + 1}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question Text */}
        <FormField
          control={form.control}
          name={`questions.${questionIndex}.text`}
          render={({ field }) => (
            <FormItem>
              <Label>Question Text *</Label>
              <FormControl>
                <Textarea
                  {...field}
                  rows={2}
                  placeholder="Enter your question here..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Question Settings */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.imageUrl`}
            render={({ field }) => (
              <FormItem>
                <Label>Image URL</Label>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://example.com/image.jpg"
                    disabled={!!watchedVideoUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                  />
                </FormControl>
                {watchedVideoUrl && (
                  <p className="text-xs text-muted-foreground">
                    Clear video URL to add image
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.videoUrl`}
            render={({ field }) => (
              <FormItem>
                <Label>Video URL</Label>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://example.com/video.mp4"
                    disabled={!!watchedImageUrl}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                  />
                </FormControl>
                {watchedImageUrl && (
                  <p className="text-xs text-muted-foreground">
                    Clear image URL to add video
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.points`}
            render={({ field }) => (
              <FormItem>
                <Label>Points</Label>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <Label className="block">Options ({optionFields.length})</Label>
              <p className="text-sm text-muted-foreground">
                Mark at least one option as correct
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Option</span>
            </Button>
          </div>

          <div className="space-y-3">
            {optionFields.map((option, oIndex) => (
              <div
                key={option.id}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  watchedOptions[oIndex]?.isCorrect ? "bg-green-50" : ""
                }`}
              >
                <FormField
                  control={form.control}
                  name={`questions.${questionIndex}.options.${oIndex}.text`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={`Enter option ${oIndex + 1}...`}
                          className={
                            !field.value?.trim() ? "border-red-500" : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2 min-w-[140px]">
                  <Switch
                    checked={watchedOptions[oIndex]?.isCorrect || false}
                    onCheckedChange={(checked) =>
                      handleOptionCorrectChange(oIndex, checked)
                    }
                  />
                  <Label
                    className={`text-sm ${
                      watchedOptions[oIndex]?.isCorrect
                        ? "text-green-600"
                        : ""
                    }`}
                  >
                    Correct
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(oIndex)}
                  className="hover:text-red-500"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {optionFields.length < 2 && (
            <p className="text-red-500 text-sm">Add at least two options</p>
          )}

          {!watchedOptions.some((opt) => opt.isCorrect) && (
            <p className="text-red-500 text-sm">
              Mark at least one option as correct
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
