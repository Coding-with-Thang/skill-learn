"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, ArrowUpDown, Search, Filter } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading"
import api from "@/utils/axios"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function QuizzesAdminPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedQuizzes, setSelectedQuizzes] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all'
  })
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
  })

  useEffect(() => {
    fetchQuizzes()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchQuizzes = async () => {
    try {
      const response = await api.get('/api/admin/quizzes')
      setQuizzes(response.data)
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    })
  }

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedQuizzes(filteredQuizzes.map(quiz => quiz.id))
    } else {
      setSelectedQuizzes([])
    }
  }

  const handleSelectQuiz = (quizId) => {
    setSelectedQuizzes(prev => {
      if (prev.includes(quizId)) {
        return prev.filter(id => id !== quizId)
      } else {
        return [...prev, quizId]
      }
    })
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedQuizzes.length} quizzes?`)) return

    try {
      await Promise.all(selectedQuizzes.map(id => api.delete(`/api/admin/quizzes/${id}`)))
      await fetchQuizzes()
      setSelectedQuizzes([])
    } catch (error) {
      console.error('Failed to delete quizzes:', error)
      alert('Failed to delete quizzes. Please try again.')
    }
  }

  const handleBulkToggleStatus = async (status) => {
    try {
      await Promise.all(selectedQuizzes.map(id =>
        api.put(`/api/admin/quizzes/${id}`, { isActive: status })
      ))
      await fetchQuizzes()
      setSelectedQuizzes([])
    } catch (error) {
      console.error('Failed to update quizzes:', error)
      alert('Failed to update quizzes. Please try again.')
    }
  }

  // Apply filters, sorting, and pagination
  const filteredQuizzes = quizzes
    .filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(filters.search.toLowerCase())
      const matchesStatus = filters.status === 'all' ||
        (filters.status === 'active' && quiz.isActive) ||
        (filters.status === 'inactive' && !quiz.isActive)
      const matchesCategory = filters.category === 'all' || quiz.category.id === filters.category

      return matchesSearch && matchesStatus && matchesCategory
    })
    .sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1
      if (sortConfig.key === 'title') {
        return direction * a.title.localeCompare(b.title)
      }
      if (sortConfig.key === 'category') {
        return direction * a.category.name.localeCompare(b.category.name)
      }
      if (sortConfig.key === 'questions') {
        return direction * (a.questions.length - b.questions.length)
      }
      return direction * (new Date(a[sortConfig.key]) - new Date(b[sortConfig.key]))
    })

  // Pagination calculations
  const totalItems = filteredQuizzes.length
  const totalPages = Math.ceil(totalItems / pagination.itemsPerPage)
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage
  const endIndex = startIndex + pagination.itemsPerPage
  const paginatedQuizzes = filteredQuizzes.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
    // Reset selected quizzes when changing pages
    setSelectedQuizzes([])
  }

  const handleItemsPerPageChange = (value) => {
    setPagination(prev => ({
      itemsPerPage: parseInt(value),
      currentPage: 1, // Reset to first page when changing items per page
    }))
    setSelectedQuizzes([])
  }

  const handleCreateQuiz = () => {
    router.push('/dashboard/quizzes/quiz-manager')
  }

  const handleEditQuiz = (quizId) => {
    router.push(`/dashboard/quizzes/quiz-manager?id=${quizId}`)
  }

  const handleViewQuiz = (quizId) => {
    router.push(`/quiz/start/${quizId}`)
  }

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return

    try {
      await api.delete(`/api/admin/quizzes/${quizId}`)
      await fetchQuizzes() // Refresh the list
    } catch (error) {
      console.error('Failed to delete quiz:', error)
      alert('Failed to delete quiz. Please try again.')
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
      <div className="p-4 text-red-500">
        Error loading quizzes. Please try again.
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Quizzes</CardTitle>
              <CardDescription>Manage your quizzes here</CardDescription>
            </div>
            <Button onClick={handleCreateQuiz}>
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
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
                    placeholder="Search quizzes..."
                    className="pl-8"
                    value={filters.search}
                    onChange={(e) => handleFilter('search', e.target.value)}
                  />
                </div>
              </div>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilter('status', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilter('category', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
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
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedQuizzes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedQuizzes.length} selected
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkToggleStatus(true)}
                >
                  Activate
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkToggleStatus(false)}
                >
                  Deactivate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border">
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
                      Title
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('category')}
                      className="flex items-center gap-1"
                    >
                      Category
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('questions')}
                      className="flex items-center gap-1"
                    >
                      Questions
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Time Limit</TableHead>
                  <TableHead>Passing Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell>{quiz.questions.length}</TableCell>
                    <TableCell>{quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}</TableCell>
                    <TableCell>{quiz.passingScore}%</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${quiz.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {quiz.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewQuiz(quiz.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditQuiz(quiz.id)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} quizzes
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