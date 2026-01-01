"use client"

import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { useCategoryStore } from "../store/categoryStore"
import { useProgressStore } from "../store/progressStore"
import { InteractiveCard, InteractiveCardContent, InteractiveCardHeader } from "@/components/ui/interactive-card"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { StatBadge } from "@/components/ui/stat-badge"
import { ProgressCard } from "@/components/ui/progress-card"
import BreadCrumbCom from "@/components/shared/BreadCrumb"
import { Loader } from "@/components/ui/loader"
import { BookOpen, Play, Trophy, CheckCircle2, Clock, Settings, Package, Users } from 'lucide-react'

// Category icon mapping
const categoryIcons = {
  "Internal Systems & Tools": Settings,
  "Product Knowledge": Package,
  "Soft Skills Training": Users,
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export default function TrainingPage() {
  const { categories, isLoading, error, fetchCategories } = useCategoryStore()
  const { stats, currentModule, fetchProgress } = useProgressStore()
  const router = useRouter()
  const [loadingCard, setLoadingCard] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchProgress()
  }, [])



  // Get category icon
  const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || BookOpen
  }

  const handleResumeTraining = () => {
    if (currentModule?.categoryId) {
      router.push(`/categories/${currentModule.categoryId}`)
    }
  }

  if (error) {
    return (
      <section className="flex flex-col items-center w-full px-4 sm:px-8 md:px-12 py-8">
        <div className="text-error mb-4">Error loading categories: {error}</div>
        <EnhancedButton
          onClick={() => fetchCategories()}
          variant="outline"
          loading={isLoading}
        >
          Retry
        </EnhancedButton>
      </section>
    )
  }

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-8" aria-label="Training Categories">
      {/* Breadcrumb - unchanged */}
      <BreadCrumbCom endtrail="My Training" />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-6 mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          My Training
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-3xl">
          Unlock your potential. Select a category below to continue your professional growth journey.
        </p>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <StatBadge
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed}
          variant="completed"
        />
        <StatBadge
          icon={Clock}
          label="In Progress"
          value={stats.inProgress}
          variant="in-progress"
        />
      </div>

      {/* Categories Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-brand-teal" />
            </div>
            <h2 className="font-semibold text-2xl text-foreground">Categories</h2>
          </div>
          <motion.button
            whileHover={{ x: 5 }}
            className="ml-auto text-sm text-brand-teal hover:text-brand-teal-dark font-medium flex items-center gap-1"
          >
            View All
            <span>→</span>
          </motion.button>
        </div>

        {!isLoading ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {categories.map((category, index) => {
              const CategoryIcon = getCategoryIcon(category.name)

              return (
                <motion.div key={category.id} variants={cardVariants}>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div
                        className="cursor-pointer"
                        onClick={async () => {
                          setLoadingCard(category.id)
                          await router.push(`/categories/${category.id}`)
                          setLoadingCard(null)
                        }}
                      >
                        <InteractiveCard
                          className={`relative min-h-[280px] flex flex-col overflow-hidden ${loadingCard === category.id ? 'opacity-50' : ''
                            }`}
                        >
                          {/* Image Header */}
                          <InteractiveCardHeader className="w-full p-0">
                            <Image
                              src={category?.imageUrl || '/placeholder-image.jpg'}
                              width={700}
                              height={200}
                              alt={category?.name || 'Category Image'}
                              className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.src = '/placeholder-image.jpg'
                              }}
                            />
                          </InteractiveCardHeader>

                          {/* Content */}
                          <InteractiveCardContent className="flex-1 flex flex-col p-6">
                            {/* Category Icon */}
                            <div className="mb-4">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <CategoryIcon className="w-7 h-7 text-white" />
                              </div>
                            </div>

                            {/* Title */}
                            <h4 className="text-lg font-bold text-foreground mb-2 group-hover:text-brand-teal transition-colors duration-200">
                              {category.name}
                            </h4>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                              Master our core internal platforms. Learn workflows, troubleshooting, and best practices.
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <BookOpen className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  {category._count?.quizzes || 0} Modules
                                </span>
                              </div>
                              <EnhancedButton
                                size="sm"
                                className="bg-brand-teal hover:bg-brand-teal-dark text-white"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/categories/${category.id}`)
                                }}
                              >
                                Start Learning
                              </EnhancedButton>
                            </div>
                          </InteractiveCardContent>
                        </InteractiveCard>
                      </div>
                    </HoverCardTrigger>

                    {/* Hover Card Tooltip */}
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Master {category.name.toLowerCase()} skills through interactive quizzes and challenges.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Play className="h-4 w-4" />
                            <span>{category._count?.quizzes || 0} quizzes</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Trophy className="h-4 w-4" />
                            <span>Earn points</span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader />
            <p className="mt-4 text-muted-foreground">Loading categories...</p>
          </div>
        )}
      </div>

      {/* Continue Where You Left Off Section */}
      {currentModule && !isLoading && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Play className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="font-semibold text-2xl text-foreground">Continue Where You Left Off</h2>
          </div>

          <ProgressCard
            title={currentModule.title || "Sales Enablement: Handling Objections"}
            category={currentModule.category || "Product Knowledge"}
            progress={currentModule.progress || 65}
            timeRemaining={currentModule.timeRemaining || "15 mins"}
            onResume={handleResumeTraining}
          />
        </div>
      )}
    </section>
  )
}