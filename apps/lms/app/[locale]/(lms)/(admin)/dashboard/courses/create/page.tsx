"use client"

import { useState, useEffect, useTransition } from "react";
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
import { ArrowLeft, Loader2, Plus, Sparkles, Clock } from "lucide-react";
import { slugify } from "@skill-learn/lib/utils/utils";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Uploader } from "@skill-learn/ui/components/file-uploader";
import { toast } from "sonner";
import api from "@skill-learn/lib/utils/axios";

export default function CreateCoursePage() {
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [pending, startTransition] = useTransition();
    const router = useRouter();

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

    const onSubmit = (values) => {

        startTransition(async () => {

            try {
                const response = await api.post('/admin/courses/create', values);
                const data = response?.data;
                // API returns { success: true, data: { status: 'success', ... } }
                const isSuccess = data?.success === true || data?.data?.status === 'success';
                
                if (isSuccess) {
                    toast.success('Course created successfully');
                    form.reset();
                    router.refresh();
                    router.push('/dashboard/courses');
                    return;
                } else if (data?.data?.status === 'error') {
                    // If server returned validation details, show them
                    const payload = data.data || {};
                    if (payload.details) {
                        // details comes from zod.flatten()
                        console.warn('Validation details:', payload.details);
                        const fieldErrors = payload.details.fieldErrors || {};
                        const messages = Object.entries(fieldErrors).flatMap(([k, v]) => (Array.isArray(v) ? v : []).map((m: string) => `${k}: ${m}`));
                        if (messages.length) {
                            messages.forEach((m) => toast.error(m));
                        } else {
                            toast.error(payload.message || 'An error occurred while creating the course');
                        }
                    } else {
                        toast.error(payload.message || 'An error occurred while creating the course');
                    }
                }
            } catch (error: unknown) {
                const e = error as { response?: { data?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } }; message?: string };
                const resp = e?.response?.data;
                if (resp) {
                    console.error('/api/admin/courses/create error response:', resp);
                    if (resp.details) {
                        const fieldErrors = resp.details.fieldErrors || {};
                        const messages = Object.entries(fieldErrors).flatMap(([k, v]) => (Array.isArray(v) ? v : []).map((m: string) => `${k}: ${m}`));
                        if (messages.length) {
                            messages.forEach((m) => toast.error(m));
                        } else {
                            toast.error(resp.message || 'An error occurred while creating the course');
                        }
                        return;
                    }
                }
                toast.error(e?.message || 'An error occurred while creating the course');
                return;
            }
        });
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
                <h1 className="text-2xl font-bold">Create Course</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                    <CardDescription>Provide basic information about the course</CardDescription>
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
                                                    // upload: { url, path }
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
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={loading ? "Loading categories..." : "Select a category"} />
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
                                                <FormLabel>Duration (minutes)</FormLabel>
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
                                                        <Clock className="ml-2 text-muted-foreground" size={18} />
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
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={loading ? "Loading status..." : "Select status"} />
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

                                    <div className="pt-4">
                                        <Button type="submit" disabled={pending} className="w-full">
                                            {pending ?
                                                (
                                                    <>
                                                        Creating...
                                                        <Loader2 className="animate-spin ml-1" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Create Course <Plus className="ml-1" size={16} />
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
        </>
    );
}