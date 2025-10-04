"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { courseSchema, courseStatusOptions } from "@/lib/zodSchemas"
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardTitle, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import slugify from 'slugify';
import { useState, useEffect } from "react";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";

export default function CreateCoursePage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const form = useForm({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: "",
            description: "",
            imageUrl: "",
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
                if (data.categories) {
                    setCategories(data.categories);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const onSubmit = (data) => {
        console.log(data)
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
                                    const slug = slugify(titleValue, { lower: true, strict: true });
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
                                            <RichTextEditor />

                                            {/* <Textarea
                                                placeholder="description"
                                                className="min-h-[120px]"
                                                {...field} /> */}
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
                                            <Input
                                                placeholder="thumbnail url"
                                                {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <Button className="">
                                Create Course <Plus className="ml-1" size={16} />
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}