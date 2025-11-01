import prisma from "@/utils/connect";
import { getSignedUrl } from '@/utils/adminStorage'
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import CourseFilters from '@/components/CourseFilters'

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

    function getPageList(curr, total) {
        // Return an array of page numbers and nulls for ellipses
        if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1);

        const delta = 2;
        const range = new Set([1, total]);
        for (let i = curr - delta; i <= curr + delta; i++) {
            if (i > 1 && i < total) range.add(i);
        }

        const pages = Array.from(range).sort((a, b) => a - b);
        const result = [];
        let last = 0;
        for (const p of pages) {
            if (last && p - last > 1) result.push(null); // ellipsis
            result.push(p);
            last = p;
        }
        return result;
    }

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
                            <Card key={course.id}>
                                {/* Thumbnail */}
                                <div className="h-40 w-full overflow-hidden rounded-t-xl bg-muted">
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

                                        <span className="text-sm text-muted-foreground">{course.duration}m</span>
                                    </CardTitle>
                                    <CardDescription className="mt-1 truncate">{course.excerptDescription}</CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Category: <span className="text-foreground">{course.category?.name || 'Uncategorized'}</span></p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <Link href={`/dashboard/courses/${course.id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                                                View
                                            </Link>
                                            <Link href={`/dashboard/courses/${course.id}/edit`} className={buttonVariants({ size: 'sm' })}>
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
            {/* Pagination controls (always visible) */}
            <div className="flex items-center justify-center gap-3 mt-6">
                {currentPage > 1 ? (
                    <Link href={`${baseHref}&page=${currentPage - 1}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        Previous
                    </Link>
                ) : (
                    <button disabled className="opacity-50 cursor-not-allowed rounded-md border px-3 py-1 text-sm">Previous</button>
                )}

                <div className="flex items-center gap-2">
                    {getPageList(currentPage, totalPages).map((p, idx) => (
                        p === null ? (
                            <span key={`e-${idx}`} className="px-2 text-sm text-muted-foreground">…</span>
                        ) : p === currentPage ? (
                            <span key={p} className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-sm font-medium">{p}</span>
                        ) : (
                            <Link key={p} href={`${baseHref}&page=${p}`} className="px-3 py-1 rounded-md border text-sm hover:bg-accent">{p}</Link>
                        )
                    ))}
                </div>

                {currentPage < totalPages ? (
                    <Link href={`${baseHref}&page=${currentPage + 1}`} className={buttonVariants({ size: 'sm' })}>
                        Next
                    </Link>
                ) : (
                    <button disabled className="opacity-50 cursor-not-allowed rounded-md border px-3 py-1 text-sm">Next</button>
                )}
            </div>
        </>
    );
}