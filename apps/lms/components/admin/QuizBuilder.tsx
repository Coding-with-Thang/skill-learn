"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
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
import { LoadingSpinner } from "@skill-learn/ui/components/loading"
import { Plus, X, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import api from "@skill-learn/lib/utils/axios"
import { handleErrorWithNotification } from "@skill-learn/lib/utils/notifications"
import { QUIZ_CONFIG } from "@/config/constants"
import { quizCreateSchema, quizUpdateSchema } from "@/lib/zodSchemas"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@skill-learn/ui/components/form-components"
import { Input } from "@skill-learn/ui/components/input"
import { Checkbox } from "@skill-learn/ui/components/checkbox"
import { Uploader } from "@skill-learn/ui/components/file-uploader"
import { AdminSwitch } from "@/components/admin/AdminSwitch"

type QuizBuilderProps = { quizId?: string | null };
export default function QuizBuilder({ quizId = null }: QuizBuilderProps) {
  const t = useTranslations("adminQuizBuilder")
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name?: string }>>([])
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
      titleFr: "",
      descriptionFr: "",
      imageUrl: "",
      fileKey: "",
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

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/admin/categories")
      const responseData = response.data?.data || response.data
      const categoriesArray = responseData?.categories || responseData || []
      setCategories(Array.isArray(categoriesArray) ? categoriesArray : [])
    } catch (error) {
      handleErrorWithNotification(error, t("toastLoadCategoriesFailed"))
      setCategories([])
    }
  }, [])

  const fetchQuizSettings = useCallback(async () => {
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
  }, [form])

  const fetchQuiz = useCallback(async () => {
    try {
      const response = await api.get(`/admin/quizzes/${quizId}`)
      const responseData = response.data?.data || response.data
      const quizData = responseData?.quiz || responseData
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        quizData.questions = []
      }
      const titleJson = quizData.titleJson as Record<string, string> | undefined;
      const descriptionJson = quizData.descriptionJson as Record<string, string> | undefined;
      form.reset({
        title: quizData.title || "",
        description: quizData.description || "",
        titleFr: titleJson?.fr || "",
        descriptionFr: descriptionJson?.fr || "",
        imageUrl: quizData.imageUrl || "",
        fileKey: quizData.fileKey || "",
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
      handleErrorWithNotification(error, t("toastLoadQuizFailed"))
    } finally {
      setLoading(false)
    }
  }, [quizId, form])

  useEffect(() => {
    fetchCategories()
    fetchQuizSettings()
    if (quizId) {
      fetchQuiz()
    } else {
      setLoading(false)
    }
  }, [quizId, fetchCategories, fetchQuizSettings, fetchQuiz])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      // Validate questions
      if (!data.questions || data.questions.length < 1) {
        toast.error(t("toastMinQuestions"))
        setSaving(false)
        return
      }

      // Validate each question
      for (const [qIndex, question] of data.questions.entries()) {
        if (!question.text.trim()) {
          toast.error(t("toastQuestionText", { number: qIndex + 1 }))
          setSaving(false)
          return
        }

        if (!question.options || question.options.length < 2) {
          toast.error(t("toastQuestionOptions", { number: qIndex + 1 }))
          setSaving(false)
          return
        }

        const hasCorrectOption = question.options.some((opt) => opt.isCorrect)
        if (!hasCorrectOption) {
          toast.error(t("toastQuestionCorrect", { number: qIndex + 1 }))
          setSaving(false)
          return
        }

        for (const [oIndex, option] of question.options.entries()) {
          if (!option.text.trim()) {
            toast.error(t("toastOptionText", { option: oIndex + 1, question: qIndex + 1 }))
            setSaving(false)
            return
          }
        }
      }

      const payload = {
        ...data,
        titleJson: { en: data.title, ...(data.titleFr ? { fr: data.titleFr } : {}) },
        descriptionJson: data.description || data.descriptionFr
          ? { ...(data.description ? { en: data.description } : {}), ...(data.descriptionFr ? { fr: data.descriptionFr } : {}) }
          : undefined,
      }
      if (quizId) {
        await api.put(`/admin/quizzes/${quizId}`, payload)
        toast.success(t("toastUpdated"))
      } else {
        await api.post("/admin/quizzes", payload)
        toast.success(t("toastCreated"))
      }

      router.refresh()
      router.push("/dashboard/quizzes")
    } catch (error) {
      handleErrorWithNotification(error, t("toastSaveFailed"))
    } finally {
      setSaving(false)
    }
  }

  const handleAddQuestion = () => {
    if (questionFields.length >= 10) {
      toast.error(t("toastMaxQuestions"))
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
      toast.error(t("toastMinQuestions"))
      return
    }
    removeQuestion(index)
    toast.info(t("toastQuestionRemoved", { number: index + 1 }))
  }

  const handleAddOption = (qIndex) => {
    const options = form.getValues(`questions.${qIndex}.options`) || []
    form.setValue(`questions.${qIndex}.options`, [
      ...options,
      { text: "", isCorrect: false },
    ])
  }

  const handleRemoveOption = (qIndex, oIndex) => {
    const options = form.getValues(`questions.${qIndex}.options`) || []
    if (options.length <= 2) {
      toast.error(t("toastMinOptions"))
      return
    }
    const next = options.filter((_, i) => i !== oIndex)
    form.setValue(`questions.${qIndex}.options`, next)
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
          {t("backToQuizzes")}
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            const getMessage = (obj) => {
              if (!obj || typeof obj !== "object") return null
              if (typeof obj.message === "string") return obj.message
              for (const v of Object.values(obj)) {
                const msg = getMessage(v)
                if (msg) return msg
              }
              return null
            }
            const message = getMessage(errors) || t("fillRequiredFields")
            toast.error(message)
          })}
        >
          {/* Quiz Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{quizId ? t("editQuiz") : t("createQuiz")}</CardTitle>
              <CardDescription>{t("enterDetails")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <FormInput name="title" label={t("title")} placeholder={t("titlePlaceholder")} required />
                <FormSelect
                  name="categoryId"
                  label={t("category")}
                  placeholder={t("selectCategory")}
                  options={categoryOptions}
                  required
                />
              </div>

              {/* Description */}
              <FormTextarea
                name="description"
                label={t("description")}
                placeholder={t("descriptionPlaceholder")}
                rows={3}
              />

              {/* Translations (French) */}
              <div className="rounded-lg border p-3 bg-muted/30">
                <p className="text-sm font-medium mb-2">{t("translationsSection") ?? "Translations (French)"}</p>
                <FormInput
                  name="titleFr"
                  label={t("titleFr") ?? "Title (French)"}
                  placeholder={t("titleFrPlaceholder") ?? "French title (optional)"}
                />
                <div className="mt-2">
                  <FormTextarea
                    name="descriptionFr"
                    label={t("descriptionFr") ?? "Description (French)"}
                    placeholder={t("descriptionFrPlaceholder") ?? "French description (optional)"}
                    rows={2}
                  />
                </div>
              </div>

              {/* Thumbnail */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("quizThumbnail")}</FormLabel>
                    <FormControl>
                      <Uploader
                        value={field.value}
                        onChange={field.onChange}
                        name="imageUrl"
                        api={api}
                        uploadEndpoint="/api/admin/upload"
                        mediaListEndpoint="/api/admin/media"
                        onUploadComplete={(upload) => {
                          form.setValue("fileKey", upload?.path ?? "", { shouldValidate: true })
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("uploaderDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quiz Settings */}
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  name="timeLimit"
                  label={t("timeLimit")}
                  type="number"
                  min="0"
                  placeholder="0"
                />
                <FormInput
                  name="passingScore"
                  label={t("passingScore")}
                  type="number"
                  min="0"
                  max="100"
                  placeholder="70"
                />
              </div>

              {/* Active Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t("active")}</FormLabel>
                      <FormDescription>{t("activeDescription")}</FormDescription>
                    </div>
                    <FormControl>
                      <AdminSwitch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Review Settings */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="showQuestionReview"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t("showQuestionReview")}</FormLabel>
                        <FormDescription>{t("showQuestionReviewDescription")}</FormDescription>
                      </div>
                      <FormControl>
                        <AdminSwitch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="showCorrectAnswers"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t("showCorrectAnswers")}</FormLabel>
                        <FormDescription>{t("showCorrectAnswersDescription")}</FormDescription>
                      </div>
                      <FormControl>
                        <AdminSwitch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!watchedShowQuestionReview}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  {t("questionsCount", { count: questionFields.length })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("addQuestionHint")}
                </p>
              </div>
              <Button type="button" onClick={handleAddQuestion} className="space-x-2">
                <Plus className="w-4 h-4" />
                <span>{t("addQuestion")}</span>
              </Button>
            </div>

            {questionFields.map((question, qIndex) => (
              <Card key={question.id} className="relative border-2 mb-4">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">
                      {t("questionNumber", { number: qIndex + 1 })}
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
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`questions.${qIndex}.text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("questionText")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("questionPlaceholder")}
                            className="font-medium"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div>
                        <FormLabel className="text-sm block">{t("answerOptions")}</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          {t("answerOptionsHint")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddOption(qIndex)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {t("addOption")}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(form.watch(`questions.${qIndex}.options`) || []).map((_, oIndex) => (
                        <div
                          key={oIndex}
                          className="flex items-center gap-3 gap-y-2 flex-wrap"
                        >
                          <FormField
                            control={form.control}
                            name={`questions.${qIndex}.options.${oIndex}.text`}
                            render={({ field }) => (
                              <FormItem className="flex-1 min-w-[200px]">
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder={t("optionPlaceholder", { number: oIndex + 1 })}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`questions.${qIndex}.options.${oIndex}.isCorrect`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center gap-2 space-y-0 shrink-0">
                                <FormControl>
                                  <Checkbox
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {t("correct")}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOption(qIndex, oIndex)}
                            disabled={(form.watch(`questions.${qIndex}.options`) || []).length <= 2}
                            className="text-muted-foreground hover:text-brand-tealestructive shrink-0"
                            aria-label={t("removeOption")}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
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
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  {quizId ? t("updating") : t("creating")}
                </>
              ) : (
                quizId ? t("updateQuiz") : t("createQuizButton")
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
