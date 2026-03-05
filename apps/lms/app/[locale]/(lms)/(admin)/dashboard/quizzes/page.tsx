"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslations } from "next-intl"
import { Link } from '@/i18n/navigation'
import { useDebounce } from "@skill-learn/lib/hooks/useDebounce"
import { useRouter } from '@/i18n/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@skill-learn/ui/components/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@skill-learn/ui/components/card"
import { Button } from "@skill-learn/ui/components/button"
import { Input } from "@skill-learn/ui/components/input"
import { Checkbox } from "@skill-learn/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@skill-learn/ui/components/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@skill-learn/ui/components/select"
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, ArrowUpDown, Search, Filter } from "lucide-react"
import { LoadingSpinner } from "@skill-learn/ui/components/loading"
import api from "@skill-learn/lib/utils/axios"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@skill-learn/ui/components/pagination"

type QuizItem = {
  id: string
  title: string
  description?: string
  isActive: boolean
  category: { id: string; name: string }
  questions?: unknown[]
  createdAt?: string
  timeLimit?: number
  passingScore?: number
}
type CategoryItem = { id: string; name: string }

export default function QuizzesAdminPage() {
  const t = useTranslations("adminDashboardQuizzes")
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<QuizItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all'
  })
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }))
  }, [debouncedSearch])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
  })

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/admin/categories')
      // Safely extract categories array
      const cats = response.data?.categories || response.data?.data || response.data || []
      setCategories((Array.isArray(cats) ? cats : []) as CategoryItem[])
    } catch {
      setCategories([])
    }
  }, [])

  const fetchQuizzes = useCallback(async () => {
    try {
      const response = await api.get('/admin/quizzes')
      // Extract quizzes from response structure (handling potential wrappers)
      const parts = response.data?.quizzes || response.data?.data?.quizzes || []
      setQuizzes((Array.isArray(parts) ? parts : []) as QuizItem[])
      setError(null)
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } }
      if (e.response?.status === 401) {
        router.push('/sign-in?redirect=/dashboard/quizzes')
        return
      } else if (e.response?.status === 403) {
        setError(t("errorPermission"))
      } else {
        setError(t("errorLoad"))
      }
    } finally {
      setLoading(false)
    }
  }, [router, t])

  useEffect(() => {
    fetchQuizzes()
    fetchCategories()
  }, [fetchQuizzes, fetchCategories])

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    })
  }

  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuizzes(filteredQuizzes.map(quiz => quiz.id))
    } else {
      setSelectedQuizzes([])
    }
  }

  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizzes(prev => {
      if (prev.includes(quizId)) {
        return prev.filter(id => id !== quizId)
      } else {
        return [...prev, quizId]
      }
    })
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(t("confirmDeleteBulk", { count: selectedQuizzes.length }))) return

    try {
      await Promise.all(selectedQuizzes.map(id => api.delete(`/admin/quizzes/${id}`)))
      await fetchQuizzes()
      setSelectedQuizzes([])
    } catch (error) {
      console.error('Failed to delete quizzes:', error)
      alert(t("errorDeleteBulk"))
    }
  }

  const handleBulkToggleStatus = async (status) => {
    try {
      await Promise.all(selectedQuizzes.map(id =>
        api.put(`/admin/quizzes/${id}`, { isActive: status })
      ))
      await fetchQuizzes()
      setSelectedQuizzes([])
    } catch {
      alert(t("errorBulkUpdate"))
    }
  }

  // Apply filters, sorting, and pagination
  const filteredQuizzes = (Array.isArray(quizzes) ? quizzes : [])
    .filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(filters.search.toLowerCase())
      const matchesStatus = filters.status === 'all' ||
        (filters.status === 'active' && quiz.isActive) ||
        (filters.status === 'inactive' && !quiz.isActive)
      const matchesCategory = filters.category === 'all' || (quiz.category?.id ?? '') === filters.category

      return matchesSearch && matchesStatus && matchesCategory
    })
    .sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1
      if (sortConfig.key === 'title') {
        return direction * a.title.localeCompare(b.title)
      }
      if (sortConfig.key === 'category') {
        return direction * (a.category?.name ?? '').localeCompare(b.category?.name ?? '')
      }
      if (sortConfig.key === 'questions') {
        const aLength = a.questions?.length || 0
        const bLength = b.questions?.length || 0
        return direction * (aLength - bLength)
      }
      const aVal = (a as Record<string, unknown>)[sortConfig.key]
      const bVal = (b as Record<string, unknown>)[sortConfig.key]
      return direction * (new Date(String(aVal ?? 0)).getTime() - new Date(String(bVal ?? 0)).getTime())
    })

  // Pagination calculations
  const totalItems = filteredQuizzes.length
  const totalPages = Math.ceil(totalItems / pagination.itemsPerPage)
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage
  const endIndex = startIndex + pagination.itemsPerPage
  const paginatedQuizzes = filteredQuizzes.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
    // Reset selected quizzes when changing pages
    setSelectedQuizzes([])
  }

  const handleItemsPerPageChange = (value: string) => {
    setPagination(prev => ({
      itemsPerPage: parseInt(value),
      currentPage: 1, // Reset to first page when changing items per page
    }))
    setSelectedQuizzes([])
  }

  const handleEditQuiz = (quizId: string) => {
    router.push(`/dashboard/quizzes/quiz-manager?id=${quizId}`)
  }

  const handleViewQuiz = (quizId: string) => {
    router.push(`/quiz/start/${quizId}`)
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm(t("confirmDeleteSingle"))) return

    try {
      await api.delete(`/admin/quizzes/${quizId}`)
      await fetchQuizzes()
    } catch {
      alert(t("errorDeleteSingle"))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t("accessError")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">{error}</p>
            {(error && error.includes('permission')) ? (
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                {t("returnToDashboard")}
              </Button>
            ) : (
              <Button onClick={fetchQuizzes}>
                {t("tryAgain")}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/quizzes/quiz-manager">
                <Plus className="w-4 h-4 mr-2" />
                {t("createQuiz")}
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchPlaceholder")}
                    className="pl-8"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              </div>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilter('status', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatus")}</SelectItem>
                  <SelectItem value="active">{t("active")}</SelectItem>
                  <SelectItem value="inactive">{t("inactive")}</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilter('category', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("filterByCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allCategories")}</SelectItem>
                  {/* Use optional chaining or array check */}
                  {(Array.isArray(categories) ? categories : []).map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={pagination.itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("itemsPerPage")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">{t("perPage10")}</SelectItem>
                  <SelectItem value="20">{t("perPage20")}</SelectItem>
                  <SelectItem value="50">{t("perPage50")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedQuizzes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t("selectedCount", { count: selectedQuizzes.length })}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkToggleStatus(true)}
                >
                  {t("activate")}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkToggleStatus(false)}
                >
                  {t("deactivate")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  {t("deleteSelected")}
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-4xld border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedQuizzes.length === paginatedQuizzes.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-1"
                    >
                      {t("titleCol")}
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('category')}
                      className="flex items-center gap-1"
                    >
                      {t("category")}
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('questions')}
                      className="flex items-center gap-1"
                    >
                      {t("questions")}
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>{t("timeLimit")}</TableHead>
                  <TableHead>{t("passingScore")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedQuizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedQuizzes.includes(quiz.id)}
                        onCheckedChange={() => handleSelectQuiz(quiz.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.category.name}</TableCell>
                    <TableCell>{quiz.questions?.length || 0}</TableCell>
                    <TableCell>{quiz.timeLimit ? `${quiz.timeLimit} min` : t("noLimit")}</TableCell>
                    <TableCell>{quiz.passingScore != null ? `${quiz.passingScore}%` : '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${quiz.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {quiz.isActive ? t("active") : t("inactive")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t("openMenu")}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewQuiz(quiz.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            {t("view")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditQuiz(quiz.id)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            {t("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-nowrap">
            <div className="text-sm text-muted-foreground">
              {t("showingRange", { start: startIndex + 1, end: Math.min(endIndex, totalItems) })}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  // Show first page, last page, and pages around current page
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === pagination.currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  }
                  // Show ellipsis for gaps
                  if (
                    page === pagination.currentPage - 2 ||
                    page === pagination.currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  return null
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}