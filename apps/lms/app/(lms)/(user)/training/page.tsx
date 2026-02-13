"use client"

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion"
import { LayoutGrid, BookOpen, GraduationCap, Heart, Filter, Grid3x3, List, X } from "lucide-react"
import { useCategoryStore } from "@skill-learn/lib/stores/categoryStore";
import { useQuizStartStore } from "@skill-learn/lib/stores/quizStore";
import { EnhancedButton } from "@skill-learn/ui/components/enhanced-button";
import { FeatureGate, FeatureDisabledPage } from "@skill-learn/ui/components/feature-gate"
import BreadCrumbCom from "@/components/shared/BreadCrumb"
import { Loader } from "@skill-learn/ui/components/loader"
import { SearchBar } from "@skill-learn/ui/components/search-bar"
import { CourseCard } from "@skill-learn/ui/components/course-card"
import { QuizCard } from "@skill-learn/ui/components/quiz-card"
import { cn, extractTextFromProseMirror } from "@skill-learn/lib/utils"
import api from "@skill-learn/lib/utils/axios"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@skill-learn/ui/components/select"
import { Checkbox } from "@skill-learn/ui/components/checkbox"

/**
 * Helper function to calculate course progress and status
 * Note: Course progress tracking is not yet implemented in the database.
 * This function currently returns defaults. Once CourseProgress model is added,
 * this should be updated to fetch actual progress data.
 */
const getCourseProgressData = (course, userProgressData = null) => {
  // Module count: Modules are not yet implemented in the schema
  // TODO: Once Module model is added, count modules: course.modules?.length || 0
  const moduleCount = 0

  // Progress: Course progress tracking is not yet implemented
  // TODO: Once CourseProgress model is added, fetch actual progress:
  // const progress = userProgressData?.courseProgress?.[course.id] || 0
  const progress = 0

  // Status: Course completion tracking is not yet implemented
  // TODO: Once CourseProgress model is added, calculate status:
  // - "not-started": progress === 0
  // - "in-progress": progress > 0 && progress < 100
  // - "completed": progress === 100
  const status = "not-started"

  return { moduleCount, progress, status }
}

export default function TrainingPage() {

  const router = useRouter()
  const { isLoaded: clerkLoaded } = useUser()
  const { categories, isLoading: categoriesLoading, fetchCategories } = useCategoryStore()
  const setSelectedQuiz = useQuizStartStore(state => state.setSelectedQuiz)

  // State
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid") // "grid" or "list"
  const [contentType, setContentType] = useState("all") // "all", "courses", "quizzes"
  const [selectedCategories, setSelectedCategories] = useState([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState("all") // "all", "quizzes", "courses", "favorites"
  const [allQuizzes, setAllQuizzes] = useState([])
  const [quizzesLoading, setQuizzesLoading] = useState(true)
  const [rawCourses, setRawCourses] = useState([]) // Store raw course data from API
  const [allCourses, setAllCourses] = useState([]) // Transformed courses with progress data
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [userProgress, setUserProgress] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)
  const [contentMessage, setContentMessage] = useState(null) // e.g. "Complete onboarding" when 400

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Fetch user progress data
  useEffect(() => {
    const fetchUserProgress = async () => {
      setProgressLoading(true)
      try {
        const response = await api.get("/user/progress")
        if (response.data?.success) {
          setUserProgress(response.data)
        }
      } catch (error) {
        console.error("Error fetching user progress:", error)
      } finally {
        setProgressLoading(false)
      }
    }

    fetchUserProgress()
  }, [])

  // Fetch all courses from the database (wait for Clerk so auth token is sent)
  useEffect(() => {
    if (!clerkLoaded) return

    const fetchCourses = async () => {
      setCoursesLoading(true)
      try {
        setContentMessage(null)
        const response = await api.get("/courses")
        const result = response.data

        // Treat 2xx as success
        const isSuccess = response.status >= 200 && response.status < 300
        if (!isSuccess || result?.success === false || result?.error) {
          if (response.status === 400 && result?.message) setContentMessage(result.message)
          if (response.status === 401) {
            setCoursesLoading(false)
            return // interceptor will redirect
          }
          console.error("Failed to fetch courses:", response.status, result)
          throw new Error(result?.error || result?.message || `Failed to fetch courses: ${response.status}`)
        }

        // API returns { success: true, data: { courses: [...] } }
        let courses = []
        const data = result?.data ?? result
        if (Array.isArray(data?.courses)) {
          courses = data.courses
        } else if (Array.isArray(result?.courses)) {
          courses = result.courses
        } else if (Array.isArray(data)) {
          courses = data
        } else if (Array.isArray(result)) {
          courses = result
        }

        if (!Array.isArray(courses)) {
          console.warn("Courses is not an array:", typeof courses, courses)
          courses = []
        }

        // Store raw course data; UI transformation happens in a separate effect
        setRawCourses(courses)
      } catch (error) {
        console.error("Error fetching courses:", error)
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error response status:", error.response.status)
          console.error("Error response data:", error.response.data)
          console.error("Error response headers:", error.response.headers)
          const errorMessage = error.response?.data?.error || error.response?.data?.message || `Server error: ${error.response.status}`
          console.error("Error message:", errorMessage)
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request)
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error setting up request:", error.message)
        }
        setRawCourses([])
      } finally {
        setCoursesLoading(false)
      }
    }

    fetchCourses()
  }, [clerkLoaded])

  // Transform courses when raw courses or user progress updates
  useEffect(() => {
    if (rawCourses.length === 0) {
      setAllCourses([])
      return
    }

    // Transform course data to match CourseCard format
    const transformedCourses = rawCourses.map(course => {
      // Format duration from minutes to "Xh Ym" format
      const hours = Math.floor((course.duration || 0) / 60)
      const minutes = (course.duration || 0) % 60
      const durationStr = hours > 0
        ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim()
        : `${minutes}m`

      // Get course progress data (currently returns defaults until progress tracking is implemented)
      const { moduleCount, progress, status } = getCourseProgressData(course, userProgress)

      return {
        id: course.id,
        title: course.title,
        description: extractTextFromProseMirror(course.description) || course.excerptDescription || "",
        imageUrl: course.imageUrl || "/placeholder-course.jpg",
        duration: durationStr,
        moduleCount,
        progress,
        status,
        category: course.category?.name || "Uncategorized"
      }
    })

    setAllCourses(transformedCourses)
  }, [rawCourses, userProgress]) // Re-transform when raw courses or user progress changes

  // Fetch all quizzes from /api/quizzes (wait for Clerk so auth token is sent)
  useEffect(() => {
    if (!clerkLoaded) return

    const fetchAllQuizzes = async () => {
      setQuizzesLoading(true)
      try {
        const response = await api.get("/quizzes")
        const result = response.data

        const isSuccess = response.status >= 200 && response.status < 300
        if (!isSuccess || result?.success === false || result?.error) {
          if (response.status === 400 && result?.message) setContentMessage(result.message)
          setAllQuizzes([])
          return
        }

        // API returns { success: true, data: { quizzes: [...] } }
        let quizzes = []
        const data = result?.data ?? result
        if (Array.isArray(data?.quizzes)) {
          quizzes = data.quizzes
        } else if (Array.isArray(result?.quizzes)) {
          quizzes = result.quizzes
        } else if (Array.isArray(data)) {
          quizzes = data
        } else if (Array.isArray(result)) {
          quizzes = result
        }

        if (!Array.isArray(quizzes)) {
          quizzes = []
        }

        // Normalize category info for filtering (category can be relation object)
        const normalized = quizzes.map((quiz) => ({
          ...quiz,
          categoryName: quiz.category?.name ?? quiz.categoryName ?? "Uncategorized",
          categoryId: quiz.category?.id ?? quiz.categoryId,
        }))
        setAllQuizzes(normalized)
      } catch (error) {
        console.error("Error fetching quizzes:", error)
        setAllQuizzes([])
      } finally {
        setQuizzesLoading(false)
      }
    }

    fetchAllQuizzes()
  }, [clerkLoaded])

  // Filter and search logic
  const filteredCourses = useMemo(() => {
    let filtered = allCourses

    // Search
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(course =>
        selectedCategories.includes(course.category)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(course =>
        course.status === statusFilter
      )
    }

    return filtered
  }, [searchQuery, selectedCategories, statusFilter, allCourses])

  const filteredQuizzes = useMemo(() => {
    let filtered = allQuizzes

    // Search
    if (searchQuery) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(quiz =>
        selectedCategories.includes(quiz.categoryName)
      )
    }

    return filtered
  }, [searchQuery, selectedCategories, allQuizzes])

  // Handle quiz click - integrate with existing quiz system
  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz)
    router.push(`/quiz/start/${quiz.id}`)
  }

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setStatusFilter("all")
  }

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 ||
    statusFilter !== "all"

  // Stats
  const stats = {
    totalCourses: allCourses.length,
    activeCourses: allCourses.filter(c => c.status === "in-progress").length,
    totalQuizzes: allQuizzes.length,
    completedQuizzes: 0, // Will be calculated from user attempts
  }

  const isLoading = quizzesLoading || coursesLoading

  // Get unique category names from both quizzes and courses
  const availableCategories = useMemo(() => {
    const categorySet = new Set()
    allQuizzes.forEach(quiz => {
      if (quiz.categoryName) categorySet.add(quiz.categoryName)
    })
    allCourses.forEach(course => {
      if (course.category) categorySet.add(course.category)
    })
    return Array.from(categorySet).sort()
  }, [allQuizzes, allCourses])

  return (
    <FeatureGate
      feature="training_courses"
      featureName="Training Courses"
      fallback={<FeatureDisabledPage featureName="Training Courses" />}
    >
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/50 p-6 sticky top-0 h-screen overflow-y-auto">
          <h2 className="text-lg font-bold text-foreground mb-6">Training Categories</h2>

          {/* Category Tabs */}
          <div className="space-y-2 mb-6">
            <button
              onClick={() => {
                setActiveTab("all")
                setContentType("all")
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                activeTab === "all"
                  ? "bg-brand-teal text-white"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <LayoutGrid className="h-5 w-5" />
              <span className="font-medium">All Content</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("courses")
                setContentType("courses")
              }}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all",
                activeTab === "courses"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Courses</span>
              </div>
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                {stats.totalCourses}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("quizzes")
                setContentType("quizzes")
              }}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all",
                activeTab === "quizzes"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5" />
                <span className="font-medium">Quizzes</span>
              </div>
              <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                {stats.totalQuizzes}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("favorites")}
              disabled={true}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:cursor-not-allowed",
                activeTab === "favorites"
                  ? "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400"
                  : "hover:bg-muted text-muted-foreground hover:cursor-not-allowed"
              )}
            >
              <Heart className="h-5 w-5" />
              <span className="font-medium">My Favorites</span>
            </button>
          </div>

          {/* Category Filters */}
          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Filter by Category</h3>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : availableCategories.length > 0 ? (
              <div className="space-y-2">
                {availableCategories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1.5 rounded transition-colors"
                  >
                    <Checkbox
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <span className="text-sm text-foreground">{category}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No categories available</p>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-8 md:px-12 py-8">
          <BreadCrumbCom crumbs={[]} endtrail="Training" />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              My Training Hub
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Explore courses and quizzes to enhance your skills and knowledge
            </p>
          </motion.div>

          {/* Search and Filters Bar */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
                placeholder="Search courses and quizzes..."
                className="flex-1"
              />

              <div className="flex gap-2">
                <EnhancedButton
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "gap-2",
                    hasActiveFilters && "border-brand-teal text-brand-teal"
                  )}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="bg-brand-teal text-white text-xs px-1.5 py-0.5 rounded-full">
                      {selectedCategories.length +
                        (statusFilter !== "all" ? 1 : 0)}
                    </span>
                  )}
                </EnhancedButton>

                <div className="flex border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === "grid"
                        ? "bg-brand-teal text-white"
                        : "bg-background hover:bg-muted"
                    )}
                    aria-label="Grid view"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === "list"
                        ? "bg-brand-teal text-white"
                        : "bg-background hover:bg-muted"
                    )}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                      <EnhancedButton
                        variant="ghost"
                        onClick={clearFilters}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Clear Filters
                      </EnhancedButton>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Message when API returns 400 (e.g. no tenant) */}
          {contentMessage && !coursesLoading && !quizzesLoading && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              {contentMessage}
              {contentMessage.includes("onboarding") && (
                <a href="/onboarding/workspace" className="ml-2 font-medium underline">Go to onboarding</a>
              )}
            </div>
          )}

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Courses Section */}
            {(contentType === "all" || contentType === "courses") && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-brand-teal" />
                    Courses
                    <span className="text-sm font-normal text-muted-foreground">
                      ({filteredCourses.length})
                    </span>
                  </h2>
                </div>

                {coursesLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader />
                    <p className="mt-4 text-muted-foreground">Loading courses...</p>
                  </div>
                ) : filteredCourses.length > 0 ? (
                  <div className={cn(
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  )}>
                    {filteredCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        variant={viewMode}
                        onClick={() => router.push(`/courses/${course.slug ?? course.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    {contentMessage || "No courses found matching your filters"}
                  </div>
                )}
              </section>
            )}

            {/* Quizzes Section */}
            {(contentType === "all" || contentType === "quizzes") && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-brand-teal" />
                    Quizzes
                    <span className="text-sm font-normal text-muted-foreground">
                      ({filteredQuizzes.length})
                    </span>
                  </h2>
                </div>

                {quizzesLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader />
                    <p className="mt-4 text-muted-foreground">Loading quizzes...</p>
                  </div>
                ) : filteredQuizzes.length > 0 ? (
                  <div className={cn(
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  )}>
                    {filteredQuizzes.map((quiz) => (
                      <QuizCard
                        key={quiz.id}
                        quiz={{
                          ...quiz,
                          questionCount: quiz.questions?.length || 0,
                          // Status: Quiz status tracking not yet implemented
                          // TODO: Once QuizAttempt data is integrated, determine status:
                          // - "not-started": no attempts
                          // - "in-progress": has attempts but none passed
                          // - "completed": has at least one passed attempt
                          status: "not-started",
                        }}
                        variant={viewMode}
                        onClick={() => handleQuizClick(quiz)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    {contentMessage || "No quizzes found matching your filters"}
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </FeatureGate>
  )
}