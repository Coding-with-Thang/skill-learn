"use client"

import { useState, useEffect } from "react"
import { useDebounce } from "@skill-learn/lib/hooks/useDebounce.js"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { LoadingSpinner } from "@skill-learn/ui/components/loading"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import { cn } from "@skill-learn/lib/utils.js"
import { toast } from "sonner"
import api from "@skill-learn/lib/utils/axios.js"
import { Form } from "@skill-learn/ui/components/form"
import { FormInput } from "@skill-learn/ui/components/form-input"
import { FormTextarea } from "@skill-learn/ui/components/form-textarea"
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@skill-learn/ui/components/form"
import { AdminSwitch } from "@/components/admin/AdminSwitch"
import { Uploader } from "@skill-learn/ui/components/file-uploader"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@skill-learn/ui/components/alert-dialog"
import {
    categoryCreateSchema,
    categoryUpdateSchema,
} from "@/lib/zodSchemas"

export default function CategoriesPage() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [formError, setFormError] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [deleteConfirmId, setDeleteConfirmId] = useState(null)
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
            fileKey: "",
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
        setFormError(null)
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
        } catch (err) {
            console.error("Failed to save category:", err)
            const msg = err.response?.data?.error || "Failed to save category"
            setFormError(msg)
            toast.error(msg)
        }
    }

    const handleCreateOrUpdateClick = () => {
        form.handleSubmit(onSubmit, () => { })()
    }

    const handleDeleteInModal = async (id) => {
        try {
            await api.delete(`/admin/categories/${id}`)
            toast.success("Category deleted successfully")
            await fetchCategories()
            setDeleteConfirmId(null)
            handleCloseForm()
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
            fileKey: category.fileKey || "",
            isActive: category.isActive === true,
        })
        setEditingId(category.id)
        setShowForm(true)
    }

    const handleCloseForm = () => {
        setFormError(null)
        form.reset({
            name: "",
            description: "",
            imageUrl: "",
            fileKey: "",
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
                        <Button className="w-full sm:w-auto" onClick={() => { setFormError(null); setShowForm(true); }}>
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
                                    <TableHead>Courses</TableHead>
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
                                        <TableCell>{category._count.courses}</TableCell>
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
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan="6" className="text-center py-4">
                                            No categories found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Form — simple modal (no Radix) so Create button always receives clicks */}
            {showForm && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="category-form-title"
                >
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={handleCloseForm}
                        aria-hidden="true"
                    />
                    <div className="relative z-10 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 id="category-form-title" className="text-lg font-semibold">
                                {editingId ? "Edit Category" : "Create Category"}
                            </h2>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={handleCloseForm}
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Form {...form}>
                            <form
                                noValidate
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    handleCreateOrUpdateClick()
                                }}
                                className="space-y-4 py-4"
                            >
                                {formError && (
                                    <div className="rounded-lg bg-destructive/10 text-destructive border border-destructive/20 px-3 py-2 text-sm" role="alert">
                                        {formError}
                                    </div>
                                )}
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

                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category image</FormLabel>
                                            <FormControl>
                                                <Uploader
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    name="imageUrl"
                                                    api={api}
                                                    mediaListEndpoint="/api/admin/media"
                                                    onUploadComplete={(upload) => {
                                                        form.setValue("fileKey", upload?.path ?? "", { shouldValidate: true })
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Upload an image, paste a URL, or choose from existing media.
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Active</FormLabel>
                                                <FormDescription>
                                                    When on, this category is available for quizzes and courses. When off, it is hidden from selection.
                                                </FormDescription>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={cn(
                                                        "text-sm tabular-nums",
                                                        field.value === true
                                                            ? "font-semibold text-primary"
                                                            : "font-medium text-muted-foreground"
                                                    )}
                                                    aria-hidden
                                                >
                                                    {field.value === true ? "On" : "Off"}
                                                </span>
                                                <FormControl>
                                                    <AdminSwitch
                                                        checked={field.value === true}
                                                        onCheckedChange={(checked) => field.onChange(!!checked)}
                                                    />
                                                </FormControl>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <div className={cn("flex flex-col-reverse sm:flex-row gap-2 pt-4")}>
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
                                </div>

                                {editingId && (() => {
                                    const categoryBeingEdited = categories.find((c) => c.id === editingId)
                                    const hasQuizzesOrCourses = categoryBeingEdited && (categoryBeingEdited._count?.quizzes > 0 || categoryBeingEdited._count?.courses > 0)
                                    return (
                                        <div className="mt-6 pt-6 border-t">
                                            <p className="text-sm text-muted-foreground mb-2">Delete this category permanently. This cannot be undone.</p>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                className="w-full sm:w-auto"
                                                disabled={hasQuizzesOrCourses}
                                                onClick={() => setDeleteConfirmId(editingId)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete category
                                            </Button>
                                            {hasQuizzesOrCourses && (
                                                <p className="text-xs text-muted-foreground mt-2">Remove all quizzes and courses from this category before deleting.</p>
                                            )}
                                        </div>
                                    )
                                })()}
                            </form>
                        </Form>
                    </div>
                </div>
            )}

            <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <AlertDialogContent className="z-[200]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this category? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteConfirmId && handleDeleteInModal(deleteConfirmId)}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
