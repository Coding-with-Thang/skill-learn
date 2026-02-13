import { prisma } from '@skill-learn/database';
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage"
import { buttonVariants } from "@skill-learn/ui/components/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@skill-learn/ui/components/card";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from 'lucide-react';
import CourseEditLink from '@/components/courses/CourseEditLink';
import CourseFilters from '@/components/courses/CourseFilters';
import CourseActions from '@/components/courses/CourseActions';
import Pagination from '@/components/shared/Pagination';
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";

async function getCourses({ page = 1, pageSize = 5, category, tenantId }: { page?: number; pageSize?: number; category?: string; tenantId?: string | null } = {}) {
    // CRITICAL: Only show courses for the current user's tenant (or global). Never show other tenants' courses.
    const tenantFilter = buildTenantContentFilter(tenantId ?? null, {});
    const where = { ...tenantFilter };
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
            } catch (err: unknown) {
                console.warn('thumbnail fetch failed for', c.id, err instanceof Error ? err.message : err)
            }

            return { ...c, thumbnailUrl }
        })
    )

    return { courses: withThumbs, total, totalPages, currentPage };
}

export default async function CoursesPage({ searchParams }) {

    const params = await searchParams;
    const page = parseInt(params?.page || "1", 10) || 1;
    const pageSize = parseInt(params?.pageSize || "5", 10) || 5;
    const category = params?.category || "";

    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // CRITICAL: Filter categories by tenant or global content using standardized utility
    const categoryWhereClause = buildTenantContentFilter(tenantId, {
      isActive: true,
    });

    const [{ courses, total, totalPages, currentPage }, categories] = await Promise.all([
        getCourses({ page, pageSize, category: category || undefined, tenantId }),
        prisma.category.findMany({ 
          where: categoryWhereClause, 
          orderBy: { name: 'asc' } 
        }),
    ]);

    const baseHref = `/dashboard/courses?pageSize=${pageSize}` + (category ? `&category=${encodeURIComponent(category)}` : '');

    return (
        <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                <h1 className="text-2xl font-bold">Courses</h1>

                <Link className={buttonVariants()} href="/dashboard/courses/create">
                    Create Course
                </Link>
            </div>
            {/* Client-side Filter & pageSize (always visible) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Card key={course.id} className="relative overflow-visible flex flex-col h-full">
                                {/*Absolute Dropdown*/}
                                <div className="absolute top-2 right-2 z-30">
                                    <CourseActions courseId={course.id} courseSlug={course.slug} />
                                </div>
                                {/* Thumbnail (flush to top and sides, no rounded corners) */}
                                <div className="h-40 w-full overflow-hidden bg-muted rounded-t-lg shrink-0 relative">
                                    <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" />
                                </div>

                                <CardHeader>
                                    <CardTitle className="flex items-start justify-between gap-4">
                                        <div className="flex flex-col gap-2 min-w-0 flex-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="truncate block font-semibold text-lg" title={course.title}>{course.title}</span>
                                                {/* Status badge */}
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${course.status === 'Published' ? 'bg-emerald-100 text-emerald-800' :
                                                    course.status === 'Achieved' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {course.status}
                                                </span>
                                            </div>
                                            <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="text-muted-foreground" size={14} />{course.duration}m</span>
                                        </div>
                                    </CardTitle>
                                    <CardDescription className="mt-1 line-clamp-2 h-10">{course.excerptDescription}</CardDescription>
                                </CardHeader>

                                <CardContent className="mt-auto pt-0">
                                    <div className="flex items-center justify-between mt-4">
                                        <div>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {course.category?.name || 'Uncategorized'}
                                            </span>
                                        </div>
                                        <div />
                                    </div>

                                    <div className="mt-3">
                                        <CourseEditLink courseId={course.id} href={`/dashboard/courses/${course.slug ?? course.id}/edit`} previewUrl={course.thumbnailUrl} className={buttonVariants({
                                            className: "w-full justify-center mt-2",
                                        })}>
                                            Edit Course <ArrowRight className="ml-2" />
                                        </CourseEditLink>
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