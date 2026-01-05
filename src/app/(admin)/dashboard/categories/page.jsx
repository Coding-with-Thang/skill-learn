"use client"

import { useState, useEffect } from "react"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { LoadingSpinner } from "@/components/ui/loading"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/utils/axios"
import { Form } from "@/components/ui/form"
import { FormInput } from "@/components/ui/form-input"
import { FormTextarea } from "@/components/ui/form-textarea"
import { FormSwitch } from "@/components/ui/form-switch"
import {
    categoryCreateSchema,
    categoryUpdateSchema,
} from "@/lib/zodSchemas"

export default function CategoriesPage() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [searchInput, setSearchInput] = useState("")
    const searchTerm = useDebounce(searchInput, 300)

    const form = useForm({
        resolver: zodResolver(
            editingId ? categoryUpdateSchema : categoryCreateSchema
        ),
        defaultValues: {
            name: "",
            description: "",
            imageUrl: "",
            isActive: true,
        },
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const response = await api.get("/admin/categories")
            // API returns { success: true, data: { categories: [...] } }
            const responseData = response.data?.data || response.data
            const categoriesArray = responseData?.categories || []
            setCategories(categoriesArray)
        } catch (error) {
            console.error("Failed to fetch categories:", error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = async (data) => {
        try {
            if (editingId) {
                await api.put(`/admin/categories/${editingId}`, data)
                toast.success("Category updated successfully")
            } else {
                await api.post("/admin/categories", data)
                toast.success("Category created successfully")
            }
            await fetchCategories()
            handleCloseForm()
        } catch (error) {
            console.error("Failed to save category:", error)
            toast.error(
                error.response?.data?.error || "Failed to save category"
            )
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?"))
            return

        try {
            await api.delete(`/admin/categories/${id}`)
            toast.success("Category deleted successfully")
            await fetchCategories()
        } catch (error) {
            console.error("Failed to delete category:", error)
            toast.error(
                error.response?.data?.error || "Failed to delete category"
            )
        }
    }

    const handleEdit = (category) => {
        form.reset({
            name: category.name,
            description: category.description || "",
            imageUrl: category.imageUrl || "",
            isActive: category.isActive,
        })
        setEditingId(category.id)
        setShowForm(true)
    }

    const handleCloseForm = () => {
        form.reset({
            name: "",
            description: "",
            imageUrl: "",
            isActive: true,
        })
        setEditingId(null)
        setShowForm(false)
    }

    const filteredCategories = categories.filter(
        (category) =>
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
            <Card className="bg-(--accent)/90">
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
                                        <TableCell className="font-medium">
                                            {category.name}
                                        </TableCell>
                                        <TableCell>{category.description || "-"}</TableCell>
                                        <TableCell>{category._count.quizzes}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${category.isActive
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {category.isActive ? "Active" : "Inactive"}
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
                            {editingId ? "Edit Category" : "Create Category"}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormInput
                                name="name"
                                label="Name"
                                placeholder="Enter category name"
                                required
                            />

                            <FormTextarea
                                name="description"
                                label="Description"
                                placeholder="Enter category description"
                            />

                            <FormInput
                                name="imageUrl"
                                label="Image URL"
                                type="url"
                                placeholder="https://example.com/image.jpg"
                            />

                            <FormSwitch
                                name="isActive"
                                label="Active"
                                description="Make this category available for use"
                            />

                            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseForm}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className="w-full sm:w-auto"
                                >
                                    {editingId ? "Update" : "Create"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
