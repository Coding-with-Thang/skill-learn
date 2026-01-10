"use client"

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"
import { LayoutGrid, BookOpen, GraduationCap, Heart, Filter, Grid3x3, List, X } from "lucide-react"
import { useCategoryStore } from "@/lib/store/categoryStore";
import { useQuizStartStore } from "@/lib/store/quizStore";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import BreadCrumbCom from "@/components/shared/BreadCrumb"
import { Loader } from "@/components/ui/loader"
import { SearchBar } from "@/components/ui/search-bar"
import { CourseCard } from "@/components/ui/course-card"
import { QuizCard } from "@/components/ui/quiz-card"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function TrainingPage() {

  const router = useRouter()
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
  const [allCourses, setAllCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Fetch all courses from the database
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true)
      try {
        const response = await fetch("/api/courses")
        if (!response.ok) {
          throw new Error("Failed to fetch courses")
        }
        const result = await response.json()
        // successResponse wraps data in { success: true, data: {...} }
        const courses = result?.data?.courses || []

        // Transform course data to match CourseCard format
        const transformedCourses = courses.map(course => {
          // Format duration from minutes to "Xh Ym" format
          const hours = Math.floor(course.duration / 60)
          const minutes = course.duration % 60
          const durationStr = hours > 0
            ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim()
            : `${minutes}m`

          return {
            id: course.id,
            title: course.title,
            description: course.description || course.excerptDescription || "",
            imageUrl: course.imageUrl || "/placeholder-course.jpg",
            duration: durationStr,
            moduleCount: 0, // TODO: Add module count when modules are implemented
            progress: 0, // TODO: Calculate from user progress when implemented
            status: "not-started", // TODO: Map from user progress (not-started, in-progress, completed)
            category: course.category?.name || "Uncategorized"
          }
        })

        setAllCourses(transformedCourses)
      } catch (error) {
        console.error("Error fetching courses:", error)
        setAllCourses([])
      } finally {
        setCoursesLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Fetch all quizzes from all categories
  useEffect(() => {
    const fetchAllQuizzes = async () => {
      if (categories.length === 0) return

      setQuizzesLoading(true)
      try {
        // Fetch quizzes for each category
        const quizPromises = categories.map(async (category) => {
          const response = await fetch(`/api/categories/${category.id}`)
          if (!response.ok) return []
          const data = await response.json()
          // Add category info to each quiz
          return (data.quizzes || []).map(quiz => ({
            ...quiz,
            categoryName: category.name,
            categoryId: category.id
          }))
        })

        const quizArrays = await Promise.all(quizPromises)
        const flatQuizzes = quizArrays.flat()
        setAllQuizzes(flatQuizzes)
      } catch (error) {
        console.error("Error fetching quizzes:", error)
      } finally {
        setQuizzesLoading(false)
      }
    }

    fetchAllQuizzes()
  }, [categories])

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

  const isLoading = categoriesLoading || quizzesLoading || coursesLoading

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
              {stats.activeCourses}
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
        <BreadCrumbCom endtrail="Training" />

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
                      onClick={() => router.push(`/courses/${course.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No courses found matching your filters
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
                        status: "not-started", // Will be updated when we integrate user attempts
                      }}
                      variant={viewMode}
                      onClick={() => handleQuizClick(quiz)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No quizzes found matching your filters
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}