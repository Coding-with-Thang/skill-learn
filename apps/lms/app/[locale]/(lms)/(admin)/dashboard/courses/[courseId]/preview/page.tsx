import { prisma } from '@skill-learn/database';
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage"
import { extractTextFromProseMirror } from "@skill-learn/lib/utils"
import { buttonVariants , Button } from "@skill-learn/ui/components/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@skill-learn/ui/components/card";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
import { notFound, redirect } from 'next/navigation';
import { getTenantContext, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";
import { resolveCourseId } from "@/lib/courses";

function looksLikeObjectId(str) {
  return typeof str === "string" && /^[a-f0-9]{24}$/i.test(str);
}

async function getCourse(courseIdOrSlug, tenantId) {
    const tenantFilter = buildTenantContentFilter(tenantId ?? null, {});
    const courseId = await resolveCourseId(courseIdOrSlug, tenantId ?? undefined);
    if (!courseId) return null;
    const course = await prisma.course.findFirst({
        where: { id: courseId, ...tenantFilter },
        include: { category: true },
    });

    // Resolve signed URL for thumbnail
    let thumbnailUrl = '/courses.png'
    if (course?.fileKey) {
        try {
            const url = await getSignedUrl(course.fileKey)
            if (url) thumbnailUrl = url
        } catch (err: unknown) {
            console.warn('thumbnail fetch failed for', course.id, err instanceof Error ? err.message : err)
        }
    }

    return course ? { ...course, thumbnailUrl } : null;
}

export default async function PreviewCoursePage({ params }) {
    const { courseId: courseIdOrSlug } = await params;
    const context = await getTenantContext();
    if (context instanceof Response) {
        notFound();
    }
    const course = await getCourse(courseIdOrSlug, context.tenantId);

    if (!course) {
        notFound();
    }

    // Use slug in URL when available: redirect if current URL has id instead of slug
    if (course.slug && looksLikeObjectId(courseIdOrSlug) && courseIdOrSlug === course.id) {
        redirect(`/dashboard/courses/${course.slug}/preview`);
    }

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/dashboard/courses"
                    className={buttonVariants({
                        variant: "outline",
                        size: "icon",
                    })}
                >
                    <ArrowLeft className="size-4" />
                </Link>
                <h1 className="text-2xl font-bold">Preview Course</h1>
            </div>

            <Card className="max-w-4xl mx-auto">
                <CardHeader className="p-0">
                    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-t-lg">
                        <Image
                            src={course.thumbnailUrl}
                            alt={course.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 1024px"
                        />
                    </div>
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
                                <CardDescription className="text-base">
                                    {course.excerptDescription}
                                </CardDescription>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${course.status === 'Published' ? 'bg-emerald-100 text-emerald-800' :
                                course.status === 'Achieved' ? 'bg-blue-100 text-blue-800' :
                                    'bg-slate-100 text-slate-800'
                                }`}>
                                {course.status}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <BookOpen className="size-4" />
                                <span>{course.category?.name || 'Uncategorized'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="size-4" />
                                <span>{course.duration} minutes</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 pt-0">
                    <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap">{extractTextFromProseMirror(course.description)}</p>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <Link
                            href={`/dashboard/courses/${course.slug ?? course.id}/edit`}
                            className={buttonVariants()}
                        >
                            Edit Course
                        </Link>
                        <Link
                            href="/dashboard/courses"
                            className={buttonVariants({ variant: "outline" })}
                        >
                            Back to Courses
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

