"use client"

import { useState, useEffect, useTransition } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { courseSchema, courseStatusOptions } from "@/lib/zodSchemas"
import { buttonVariants , Button } from "@skill-learn/ui/components/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@skill-learn/ui/components/form"
import { Input } from "@skill-learn/ui/components/input"
import { Card, CardTitle, CardContent, CardDescription, CardHeader } from "@skill-learn/ui/components/card";
import { Textarea } from "@skill-learn/ui/components/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@skill-learn/ui/components/select"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@skill-learn/ui/components/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@skill-learn/ui/components/dialog";
import { ArrowLeft, Loader2, Save, Sparkles, Clock, AlertTriangle } from "lucide-react";
import { slugify } from "@skill-learn/lib/utils/utils";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Uploader } from "@skill-learn/ui/components/file-uploader";
import { toast } from "sonner";
import api from "@skill-learn/lib/utils/axios";
import { useCoursesStore } from "@skill-learn/lib/stores/coursesStore"
import CourseStructure from '@/components/courses/CourseStructure'

type AxiosErr = { response?: { data?: { message?: string; fieldErrors?: { title?: string[] }; details?: { fieldErrors?: { title?: string[] } }; error?: string } } };

export default function EditCoursePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const courseId = params.courseId;
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [course, setCourse] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);
    const [courseLoading, setCourseLoading] = useState(true);
    const tabFromUrl = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(tabFromUrl === "structure" ? "structure" : "details");
    useEffect(() => {
        if (tabFromUrl === "structure") setActiveTab("structure");
        else if (tabFromUrl === "details") setActiveTab("details");
    }, [tabFromUrl]);
    const [chapterToDelete, setChapterToDelete] = useState<{ id: string; title?: string } | null>(null);
    const [deleteChapterPending, setDeleteChapterPending] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState<{ chapterId: string; lesson: { id: string; title?: string } } | null>(null);
    const [deleteLessonPending, setDeleteLessonPending] = useState(false);
    const [structureMutationPending, setStructureMutationPending] = useState(false);
    const [structureRefreshing, setStructureRefreshing] = useState(false);
    const [addChapterDialogOpen, setAddChapterDialogOpen] = useState(false);
    const [addChapterTitle, setAddChapterTitle] = useState("New Chapter");
    const [addChapterTitleError, setAddChapterTitleError] = useState<string | null>(null);
    const [addLessonDialogOpen, setAddLessonDialogOpen] = useState(false);
    const [addLessonChapterId, setAddLessonChapterId] = useState<string | null>(null);
    const [addLessonTitle, setAddLessonTitle] = useState("New Lesson");
    const [addLessonTitleError, setAddLessonTitleError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const router = useRouter();
    // Read preview from client store early so fetchCourse can prefer it
    const previewImageUrl = useCoursesStore((s) => s.previewImageUrl)
    const setPreviewImageUrl = useCoursesStore((s) => s.setPreviewImageUrl)
    const setSelectedCourseId = useCoursesStore((s) => s.setSelectedCourseId)

    const form = useForm({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: "",
            description: "",
            imageUrl: "",
            fileKey: "",
            category: "",
            duration: 1,
            status: "Draft",
            excerptDescription: "",
            slug: "",
        },
    })

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                const data = await response.json();
                // API returns { success: true, data: { categories: [...] } }
                const categories = data.data?.categories || data.categories || [];
                if (categories.length > 0) {
                    setCategories(categories);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) return;

            try {
                const response = await api.get(`/admin/courses/${courseId}`);
                // API returns { success: true, data: { course: {...} } }
                const responseData = response.data;
                const course = responseData?.data?.course || responseData?.course || responseData;

                if (course) {
                    setCourse(course);
                    form.reset({
                        title: course.title || "",
                        description: course.description || "",
                        // Prefer any client-side preview (set when clicking Edit) so preview doesn't flash
                        imageUrl: previewImageUrl || course.imageUrl || "",
                        fileKey: course.fileKey || "",
                        category: course.categoryId || "",
                        duration: course.duration || 1,
                        status: course.status || "Draft",
                        excerptDescription: course.excerptDescription || "",
                        slug: course.slug || "",
                    });
                    // If we have a preview from the client store, ensure uploader sees it
                    if (previewImageUrl) {
                        form.setValue('imageUrl', previewImageUrl, { shouldValidate: true })
                    }
                }
            } catch (error) {
                console.error('Error fetching course:', error);
                toast.error('Failed to load course details');
                router.push('/dashboard/courses');
            } finally {
                setCourseLoading(false);
            }
        };

        fetchCourse();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- form is used imperatively; including it can cause infinite re-runs
    }, [courseId]);

    // If there's a preview image URL stored in the client store (set when clicking Edit), prefer that
    useEffect(() => {
        if (previewImageUrl) {
            // prefer the client-side preview over server-supplied imageUrl so preview shows instantly
            form.setValue('imageUrl', previewImageUrl, { shouldValidate: true })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewImageUrl])

    // Clear preview/selection on unmount to avoid stale preview on next edit
    useEffect(() => {
        return () => {
            try {
                setPreviewImageUrl(null)
                setSelectedCourseId(null)
            } catch (e) {
                // noop
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Refresh course when tab becomes visible (e.g. user returns from another tab) to reduce stale data
    // (e.g. another tab deleted a chapter; reorder would 404 until we refetch)
    useEffect(() => {
        if (!courseId || !course) return;
        const handleVisibilityChange = () => {
            if (typeof document !== "undefined" && document.visibilityState === "visible") {
                refreshCourse({ silent: true });
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId, course]);

    const refreshCourse = async (options: { silent?: boolean } = {}) => {
        const { silent } = options;
        try {
            const res = await api.get(`/admin/courses/${courseId}`);
            const d = res.data?.data?.course || res.data?.course || res.data;
            if (d) setCourse(d);
        } catch (e) {
            if (!silent) toast.error('Failed to refresh course');
        }
    };

    const handleConfirmDeleteChapter = async () => {
        if (!chapterToDelete) return;
        setDeleteChapterPending(true);
        setStructureMutationPending(true);
        try {
            await api.delete(`/admin/courses/${courseId}/chapters/${chapterToDelete.id}`);
            toast.success('Chapter deleted');
            setChapterToDelete(null);
            setStructureRefreshing(true);
            try {
                await refreshCourse();
            } finally {
                setStructureRefreshing(false);
            }
        } catch (err: unknown) {
            const e = err as AxiosErr;
            toast.error(e?.response?.data?.message || 'Failed to delete chapter');
            await refreshCourse({ silent: true }); // Revert UI to server state (toast already shown above)
        } finally {
            setDeleteChapterPending(false);
            setStructureMutationPending(false);
        }
    };

    const TITLE_MIN = 1;
    const TITLE_MAX = 200;

    const openAddChapterDialog = () => {
        if (structureMutationPending) return;
        setAddChapterTitle("New Chapter");
        setAddChapterTitleError(null);
        setAddChapterDialogOpen(true);
    };

    const handleAddChapterSubmit = async () => {
        const title = addChapterTitle.trim();
        setAddChapterTitleError(null);
        if (title.length < TITLE_MIN) {
            setAddChapterTitleError("Title is required.");
            return;
        }
        if (title.length > TITLE_MAX) {
            setAddChapterTitleError(`Title must be ${TITLE_MAX} characters or less.`);
            return;
        }
        setStructureMutationPending(true);
        try {
            await api.post(`/admin/courses/${courseId}/chapters`, { title });
            toast.success('Chapter added');
            setAddChapterDialogOpen(false);
            setStructureRefreshing(true);
            try {
                await refreshCourse();
            } finally {
                setStructureRefreshing(false);
            }
        } catch (err: unknown) {
            const e = err as AxiosErr;
            const fieldErrors = e?.response?.data?.fieldErrors ?? e?.response?.data?.details?.fieldErrors;
            const msg = fieldErrors?.title?.[0] ?? e?.response?.data?.error ?? e?.response?.data?.message;
            setAddChapterTitleError(msg || "Failed to add chapter.");
            await refreshCourse({ silent: true });
        } finally {
            setStructureMutationPending(false);
        }
    };

    const openAddLessonDialog = (chapterId) => {
        if (structureMutationPending) return;
        setAddLessonChapterId(chapterId);
        setAddLessonTitle("New Lesson");
        setAddLessonTitleError(null);
        setAddLessonDialogOpen(true);
    };

    const handleAddLessonSubmit = async () => {
        if (!addLessonChapterId) return;
        const title = addLessonTitle.trim();
        setAddLessonTitleError(null);
        if (title.length < TITLE_MIN) {
            setAddLessonTitleError("Title is required.");
            return;
        }
        if (title.length > TITLE_MAX) {
            setAddLessonTitleError(`Title must be ${TITLE_MAX} characters or less.`);
            return;
        }
        setStructureMutationPending(true);
        try {
            await api.post(`/admin/courses/${courseId}/chapters/${addLessonChapterId}/lessons`, { title });
            toast.success('Lesson added');
            setAddLessonDialogOpen(false);
            setAddLessonChapterId(null);
            setStructureRefreshing(true);
            try {
                await refreshCourse();
            } finally {
                setStructureRefreshing(false);
            }
        } catch (err: unknown) {
            const e = err as AxiosErr;
            const fieldErrors = e?.response?.data?.fieldErrors ?? e?.response?.data?.details?.fieldErrors;
            const msg = fieldErrors?.title?.[0] ?? e?.response?.data?.error ?? e?.response?.data?.message;
            setAddLessonTitleError(msg || "Failed to add lesson.");
            await refreshCourse({ silent: true });
        } finally {
            setStructureMutationPending(false);
        }
    };

    const handleConfirmDeleteLesson = async () => {
        if (!lessonToDelete) return;
        setDeleteLessonPending(true);
        setStructureMutationPending(true);
        try {
            await api.delete(`/admin/courses/${courseId}/chapters/${lessonToDelete.chapterId}/lessons/${lessonToDelete.lesson.id}`);
            toast.success('Lesson deleted');
            setLessonToDelete(null);
            setStructureRefreshing(true);
            try {
                await refreshCourse();
            } finally {
                setStructureRefreshing(false);
            }
        } catch (err: unknown) {
            const e = err as AxiosErr;
            toast.error(e?.response?.data?.message || 'Failed to delete lesson');
            await refreshCourse({ silent: true }); // Revert UI to server state (toast already shown above)
        } finally {
            setDeleteLessonPending(false);
            setStructureMutationPending(false);
        }
    };

    const onSubmit = (values) => {
        startTransition(async () => {
            try {
                const response = await api.put(`/admin/courses/${courseId}`, values);
                const data = response?.data;
                // API returns { success: true, data: { ... } }
                const isSuccess = data?.success === true || data?.data?.status === 'success';

                if (isSuccess) {
                    // clear any client-side preview/selection before navigating away
                    try {
                        setPreviewImageUrl(null)
                        setSelectedCourseId(null)
                    } catch (e) {
                        // noop
                    }
                    toast.success('Course updated successfully');
                    router.refresh();
                    router.push('/dashboard/courses');
                    return;
                } else if (data?.data?.status === 'error') {
                    const payload = data.data || {};
                    if (payload.details) {
                        const fieldErrors = payload.details.fieldErrors || {};
                        const messages = Object.entries(fieldErrors).flatMap(([k, v]) => (Array.isArray(v) ? v : []).map((m: string) => `${k}: ${m}`));
                        if (messages.length) {
                            messages.forEach((m) => toast.error(m));
                        } else {
                            toast.error(payload.message || 'An error occurred while updating the course');
                        }
                    } else {
                        toast.error(payload.message || 'An error occurred while updating the course');
                    }
                }
            } catch (error: unknown) {
                const e = error as { response?: { data?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } }; message?: string };
                const resp = e?.response?.data;
                if (resp) {
                    console.error(`/api/admin/courses/${courseId} error response:`, resp);
                    if (resp.details) {
                        const fieldErrors = resp.details.fieldErrors || {};
                        const messages = Object.entries(fieldErrors).flatMap(([k, v]) => (Array.isArray(v) ? v : []).map((m: string) => `${k}: ${m}`));
                        if (messages.length) {
                            messages.forEach((m) => toast.error(m));
                        } else {
                            toast.error(resp.message || 'An error occurred while updating the course');
                        }
                        return;
                    }
                }
                toast.error(e?.message || 'An error occurred while updating the course');
                return;
            }
        });
    }

    if (courseLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/courses" className={buttonVariants({
                        variant: "outline",
                        size: "icon",
                    })}>
                    <ArrowLeft className="size-4" />
                </Link>
                <h1 className="text-2xl font-bold">Edit Course</h1>
            </div>

            <div className="flex gap-2 border-b">
                <button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "details"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Course Details
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("structure")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "structure"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Course Structure
                </button>
            </div>

            {activeTab === "details" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Course Information</CardTitle>
                        <CardDescription>Update the course information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                <div className="flex gap-4 items-end">
                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem className="full-w">
                                                <FormLabel>Slug</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Slug" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                    <Button type="button" className="w-fit" onClick={() => {
                                        const titleValue = form.getValues("title");
                                        const slug = slugify(titleValue) || "course";
                                        form.setValue("slug", slug, { shouldValidate: true });
                                    }}>
                                        Generate Slug <Sparkles className="ml-1" size="16" />
                                    </Button>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="excerptDescription"
                                    render={({ field }) => (
                                        <FormItem className="full-w">
                                            <FormLabel>Excerpt Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="description"
                                                    className="min-h-[120px]"
                                                    {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="full-w">
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <RichTextEditor field={field} editorClass="text-xs" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem className="full-w">
                                            <FormLabel>Thumbnail Image</FormLabel>
                                            <FormControl>
                                                <Uploader
                                                    onChange={field.onChange}
                                                    value={field.value}
                                                    name={field.name}
                                                    api={api}
                                                    mediaListEndpoint="/api/admin/media"
                                                    onUploadComplete={(upload) => {
                                                        form.setValue('fileKey', upload?.path || '', { shouldValidate: true });
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="category"
                                            render={({ field }) => (
                                                <FormItem className="full-w">
                                                    <FormLabel>Category</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {categories.map((category) => (
                                                                <SelectItem key={category.id} value={category.id}>
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                        <FormField
                                            control={form.control}
                                            name="duration"
                                            render={({ field }) => (
                                                <FormItem className="full-w">
                                                    <FormLabel className="flex align-center gap-1">
                                                        <Clock className="ml-2 text-muted-foreground" size={18} />
                                                        Duration (minutes)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center">
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                step={1}
                                                                aria-label="Duration in minutes"
                                                                value={field.value}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                                placeholder="e.g. 30"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <p className="text-sm text-muted-foreground mt-1">Estimated duration in minutes.</p>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                    </div>

                                    <div className="flex flex-col justify-between">
                                        <div>
                                            <FormField
                                                control={form.control}
                                                name="status"
                                                render={({ field }) => (
                                                    <FormItem className="full-w">
                                                        <FormLabel>Status</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select status" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {courseStatusOptions.map((status) => (
                                                                    <SelectItem key={status} value={status}>
                                                                        {status}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                        </div>

                                        <div>
                                            <Button type="submit" disabled={pending} className="w-full">
                                                {pending ?
                                                    (
                                                        <>
                                                            Saving...
                                                            <Loader2 className="animate-spin ml-1" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            Save
                                                        </>
                                                    )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}

            {activeTab === "structure" && (
                <Card className="relative">
                    <CardHeader>
                        <CardTitle>Course Structure</CardTitle>
                        <CardDescription>Chapters and curriculum. Add, reorder, or remove chapters and lessons.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                        {structureRefreshing && (
                            <div
                                className="absolute inset-0 z-10 flex items-center justify-center rounded-b-lg bg-background/70 backdrop-blur-[1px]"
                                aria-busy="true"
                                aria-live="polite"
                            >
                                <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
                            </div>
                        )}
                        <CourseStructure
                            course={course}
                            courseId={courseId}
                            courseSlug={course?.slug ?? courseId}
                            mutationPending={structureMutationPending}
                            onDeleteChapter={(chapter) => setChapterToDelete(chapter)}
                            onAddChapter={openAddChapterDialog}
                            onRenameChapter={async (chapterId, newTitle) => {
                                if (structureMutationPending) return;
                                const chapters = (course?.chapters as { id: string; title?: string; position?: number; order?: number }[] | undefined);
                                const chapter = chapters?.find((ch) => ch.id === chapterId);
                                if (!chapter) return;
                                setStructureMutationPending(true);
                                try {
                                    await api.put(`/admin/courses/${courseId}/chapters/${chapterId}`, {
                                        title: newTitle,
                                        order: chapter.position ?? chapter.order ?? 0,
                                    });
                                    toast.success('Chapter renamed');
                                    setStructureRefreshing(true);
                                    try {
                                        await refreshCourse();
                                    } finally {
                                        setStructureRefreshing(false);
                                    }
                                } catch (err: unknown) {
                                    const e = err as AxiosErr;
                                    toast.error(e?.response?.data?.message || 'Failed to rename chapter');
                                    await refreshCourse({ silent: true });
                                } finally {
                                    setStructureMutationPending(false);
                                }
                            }}
                            onReorderChapters={async (chapterIds) => {
                                if (structureMutationPending) return;
                                setStructureMutationPending(true);
                                try {
                                    await api.put(`/admin/courses/${courseId}/chapters/reorder`, { chapterIds });
                                    toast.success('Chapters reordered');
                                    setStructureRefreshing(true);
                                    try {
                                        await refreshCourse();
                                    } finally {
                                        setStructureRefreshing(false);
                                    }
                                } catch (err: unknown) {
                                    const e = err as AxiosErr;
                                    toast.error(e?.response?.data?.message || 'Failed to reorder chapters');
                                    await refreshCourse({ silent: true });
                                } finally {
                                    setStructureMutationPending(false);
                                }
                            }}
                            onAddLesson={openAddLessonDialog}
                            onDeleteLesson={(chapterId, lesson) => setLessonToDelete({ chapterId, lesson })}
                            onReorderLessons={async (chapterId, lessonIds) => {
                                if (structureMutationPending) return;
                                setStructureMutationPending(true);
                                try {
                                    await api.put(`/admin/courses/${courseId}/chapters/${chapterId}/lessons/reorder`, { lessonIds });
                                    toast.success('Lessons reordered');
                                    setStructureRefreshing(true);
                                    try {
                                        await refreshCourse();
                                    } finally {
                                        setStructureRefreshing(false);
                                    }
                                } catch (err: unknown) {
                                    const e = err as AxiosErr;
                                    toast.error(e?.response?.data?.message || 'Failed to reorder lessons');
                                    await refreshCourse({ silent: true });
                                } finally {
                                    setStructureMutationPending(false);
                                }
                            }}
                        />
                    </CardContent>
                </Card>
            )}

            <AlertDialog open={!!chapterToDelete} onOpenChange={(open) => !open && setChapterToDelete(null)}>
                <AlertDialogContent className="max-w-[400px] flex flex-col items-center text-center p-8 gap-6">
                    <div className="rounded-full bg-red-100 p-3">
                        <AlertTriangle className="size-6 text-red-600" />
                    </div>
                    <AlertDialogHeader className="items-center space-y-2">
                        <AlertDialogTitle className="text-xl font-semibold">Delete Chapter?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-muted-foreground">
                            This will permanently delete the chapter <span className="font-medium text-foreground">&quot;{chapterToDelete?.title}&quot;</span> and <span className="font-medium text-red-600">all lessons inside it</span>.
                            <br />
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="w-full sm:justify-between gap-2">
                        <AlertDialogCancel disabled={deleteChapterPending} className="flex-1 mt-0">Cancel</AlertDialogCancel>
                        <Button
                            variant="destructive"
                            disabled={deleteChapterPending}
                            onClick={handleConfirmDeleteChapter}
                            className="flex-1"
                        >
                            {deleteChapterPending ? (
                                <>
                                    Deleting... <Loader2 className="ml-1 size-4 animate-spin inline" />
                                </>
                            ) : (
                                'Delete Chapter'
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!lessonToDelete} onOpenChange={(open) => !open && setLessonToDelete(null)}>
                <AlertDialogContent className="max-w-[400px] flex flex-col items-center text-center p-8 gap-6">
                    <div className="rounded-full bg-red-100 p-3">
                        <AlertTriangle className="size-6 text-red-600" />
                    </div>
                    <AlertDialogHeader className="items-center space-y-2">
                        <AlertDialogTitle className="text-xl font-semibold">Delete Lesson?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-muted-foreground">
                            This will permanently delete the lesson <span className="font-medium text-foreground">&quot;{lessonToDelete?.lesson?.title}&quot;</span>.
                            <br />
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="w-full sm:justify-between gap-2">
                        <AlertDialogCancel disabled={deleteLessonPending} className="flex-1 mt-0">Cancel</AlertDialogCancel>
                        <Button
                            variant="destructive"
                            disabled={deleteLessonPending}
                            onClick={handleConfirmDeleteLesson}
                            className="flex-1"
                        >
                            {deleteLessonPending ? (
                                <>
                                    Deleting... <Loader2 className="ml-1 size-4 animate-spin inline" />
                                </>
                            ) : (
                                'Delete Lesson'
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={addChapterDialogOpen} onOpenChange={(open) => { if (!open) setAddChapterTitleError(null); setAddChapterDialogOpen(open); }}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Add chapter</DialogTitle>
                        <DialogDescription>Give the chapter a title. You can rename it later in the course wizard.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <label htmlFor="add-chapter-title" className="text-sm font-medium">Title</label>
                            <Input
                                id="add-chapter-title"
                                value={addChapterTitle}
                                onChange={(e) => { setAddChapterTitle(e.target.value); setAddChapterTitleError(null); }}
                                placeholder="New Chapter"
                                aria-invalid={!!addChapterTitleError}
                                aria-describedby={addChapterTitleError ? "add-chapter-title-error" : undefined}
                                className={addChapterTitleError ? "border-destructive focus-visible:ring-destructive" : ""}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddChapterSubmit())}
                            />
                            {addChapterTitleError && (
                                <p id="add-chapter-title-error" role="alert" className="text-sm text-brand-tealestructive">
                                    {addChapterTitleError}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddChapterDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddChapterSubmit} disabled={structureMutationPending}>
                            {structureMutationPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Adding... </> : "Add chapter"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={addLessonDialogOpen} onOpenChange={(open) => { if (!open) { setAddLessonChapterId(null); setAddLessonTitleError(null); } setAddLessonDialogOpen(open); }}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Add lesson</DialogTitle>
                        <DialogDescription>Give the lesson a title. You can rename it later in the course wizard.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <label htmlFor="add-lesson-title" className="text-sm font-medium">Title</label>
                            <Input
                                id="add-lesson-title"
                                value={addLessonTitle}
                                onChange={(e) => { setAddLessonTitle(e.target.value); setAddLessonTitleError(null); }}
                                placeholder="New Lesson"
                                aria-invalid={!!addLessonTitleError}
                                aria-describedby={addLessonTitleError ? "add-lesson-title-error" : undefined}
                                className={addLessonTitleError ? "border-destructive focus-visible:ring-destructive" : ""}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLessonSubmit())}
                            />
                            {addLessonTitleError && (
                                <p id="add-lesson-title-error" role="alert" className="text-sm text-brand-tealestructive">
                                    {addLessonTitleError}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddLessonDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddLessonSubmit} disabled={structureMutationPending || !addLessonChapterId}>
                            {structureMutationPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Adding... </> : "Add lesson"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

