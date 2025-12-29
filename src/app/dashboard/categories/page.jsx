"use client"

import { useState, useEffect } from 'react'
import { useDebounce } from '@/lib/hooks/useDebounce'
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import api from "@/utils/axios"

export default function CategoriesPage() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        isActive: true
    })
    const [editingId, setEditingId] = useState(null)
    const [searchInput, setSearchInput] = useState('')
    const searchTerm = useDebounce(searchInput, 300)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const response = await api.get('/admin/categories')
            setCategories(response.data)
        } catch (error) {
            console.error('Failed to fetch categories:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingId) {
                await api.put(`/admin/categories/${editingId}`, formData)
                toast.success('Category updated successfully')
            } else {
                await api.post('/admin/categories', formData)
                toast.success('Category created successfully')
            }
            await fetchCategories()
            handleCloseForm()
        } catch (error) {
            console.error('Failed to save category:', error)
            toast.error(error.response?.data?.error || 'Failed to save category')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return

        try {
            await api.delete(`/admin/categories/${id}`)
            toast.success('Category deleted successfully')
            await fetchCategories()
        } catch (error) {
            console.error('Failed to delete category:', error)
            toast.error(error.response?.data?.error || 'Failed to delete category')
        }
    }

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            description: category.description || '',
            imageUrl: category.imageUrl || '',
            isActive: category.isActive
        })
        setEditingId(category.id)
        setShowForm(true)
    }

    const handleCloseForm = () => {
        setFormData({
            name: '',
            description: '',
            imageUrl: '',
            isActive: true
        })
        setEditingId(null)
        setShowForm(false)
    }

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                Error loading categories. Please try again.
            </div>
        )
    }

    return (
        <div className="px-2 sm:px-6 py-6 w-full max-w-5xl mx-auto">
            <Card className="bg-[var(--accent)]/90">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div>
                            <CardTitle>Categories</CardTitle>
                            <CardDescription>Manage quiz categories</CardDescription>
                        </div>
                        <Button className="w-full sm:w-auto" onClick={() => setShowForm(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Category
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="mb-6">
                        <Input
                            placeholder="Search categories..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full max-w-sm"
                        />
                    </div>

                    {/* Categories Table */}
                    <div className="rounded-md border overflow-x-auto">
                        <Table className="min-w-[600px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Quizzes</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>{category.description || '-'}</TableCell>
                                        <TableCell>{category._count.quizzes}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${category.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(category)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(category.id)}
                                                className="text-red-500"
                                                disabled={category._count.quizzes > 0}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan="5" className="text-center py-4">
                                            No categories found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Form Dialog */}
            <Dialog open={showForm} onOpenChange={handleCloseForm}>
                <DialogContent className="max-w-lg w-full">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? 'Edit Category' : 'Create Category'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                                    }
                                    className="w-full"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    className="w-full"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="imageUrl">Image URL</Label>
                                <Input
                                    id="imageUrl"
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                                    }
                                    className="w-full"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => {
                                        setFormData((prev) => ({ ...prev, isActive: checked }));
                                    }}
                                />
                                <Label htmlFor="isActive">Active</Label>
                            </div>
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={handleCloseForm} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button type="submit" className="w-full sm:w-auto">
                                {editingId ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
