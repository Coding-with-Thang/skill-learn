import prisma from "@/utils/connect";
import { getSignedUrl } from '@/utils/adminStorage'
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import Link from "next/link";
import {
    Clock, ArrowRight
} from 'lucide-react'
import CourseFilters from '@/components/CourseFilters'
import Pagination from '@/components/Pagination'
import CourseActions from '@/components/CourseActions'

async function getCourses({ page = 1, pageSize = 5, category } = {}) {
    const where = {};
    if (category) where.categoryId = category;

    const total = await prisma.course.count({ where });

    // Clamp page and calculate skip
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const skip = (currentPage - 1) * pageSize;

    const courses = await prisma.course.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: { category: true },
    });

    // Resolve signed URLs for thumbnails (fileKey). If unavailable, use default image
    const withThumbs = await Promise.all(
        courses.map(async (c) => {
            let thumbnailUrl = '/courses.png'
            try {
                if (c.fileKey) {
                    const url = await getSignedUrl(c.fileKey)
                    if (url) thumbnailUrl = url
                }
            } catch (err) {
                console.warn('thumbnail fetch failed for', c.id, err?.message || err)
            }

            return { ...c, thumbnailUrl }
        })
    )

    return { courses: withThumbs, total, totalPages, currentPage };
}

export default async function CoursesPage({ searchParams }) {
    const page = parseInt(searchParams?.page || "1", 10) || 1;
    const pageSize = parseInt(searchParams?.pageSize || "5", 10) || 5;
    const category = searchParams?.category || "";

    const [{ courses, total, totalPages, currentPage }, categories] = await Promise.all([
        getCourses({ page, pageSize, category: category || undefined }),
        prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    ]);

    const baseHref = `/dashboard/courses?pageSize=${pageSize}` + (category ? `&category=${encodeURIComponent(category)}` : '');

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Courses</h1>

                <Link className={buttonVariants()} href="/dashboard/courses/create">
                    Create Course
                </Link>
            </div>
            {/* Client-side Filter & pageSize (always visible) */}
            <div className="flex items-center justify-between mb-4 gap-4">
                <CourseFilters categories={categories} initialCategory={category} initialPageSize={pageSize} />

                <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{total === 0 ? 0 : Math.min((currentPage - 1) * pageSize + 1, total || 0)}</span> - <span className="font-medium">{total === 0 ? 0 : Math.min(currentPage * pageSize, total)}</span> of <span className="font-medium">{total}</span>
                </div>
            </div>

            {courses.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No courses yet</CardTitle>
                        <CardDescription>There are currently no courses in the system. Create one to get started.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/courses/create" className={buttonVariants()}>
                            Create your first course
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* ...existing code for course cards... */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Card key={course.id} className="relative overflow-visible">
                                {/*Absolute Dropdown*/}
                                <div className="absolute top-2 right-2 z-30">
                                    <CourseActions courseId={course.id} />
                                </div>
                                {/* Thumbnail (flush to top and sides, no rounded corners) */}
                                <div className="h-40 w-full overflow-hidden bg-muted">
                                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                                </div>

                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="truncate">{course.title}</span>
                                            {/* Status badge */}
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${course.status === 'Published' ? 'bg-emerald-100 text-emerald-800' :
                                                course.status === 'Achieved' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-slate-100 text-slate-800'
                                                }`}>
                                                {course.status}
                                            </span>
                                        </div>

                                        <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="text-muted-foreground" size={14} />{course.duration}m</span>
                                    </CardTitle>
                                    <CardDescription className="mt-1 truncate">{course.excerptDescription}</CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {course.category?.name || 'Uncategorized'}
                                            </span>
                                        </div>

                                        <div />
                                    </div>

                                    <div className="mt-3">
                                        <Link href={`/dashboard/courses/${course.id}/edit`} className={buttonVariants({
                                            className: "w-full justify-center mt-4",
                                        })}>
                                            Edit Course <ArrowRight className="ml-2" />
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
            {/* Pagination controls (reusable component) */}
            <Pagination baseHref={baseHref} currentPage={currentPage} totalPages={totalPages} />
        </>
    );
}