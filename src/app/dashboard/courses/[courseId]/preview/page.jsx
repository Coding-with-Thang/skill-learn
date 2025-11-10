import prisma from "@/utils/connect";
import { getSignedUrl } from '@/utils/adminStorage'
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import Link from "next/link";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
import { notFound } from 'next/navigation';

async function getCourse(courseId) {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { category: true },
    });

    // Resolve signed URL for thumbnail
    let thumbnailUrl = '/courses.png'
    if (course?.fileKey) {
        try {
            const url = await getSignedUrl(course.fileKey)
            if (url) thumbnailUrl = url
        } catch (err) {
            console.warn('thumbnail fetch failed for', course.id, err?.message || err)
        }
    }

    return course ? { ...course, thumbnailUrl } : null;
}

export default async function PreviewCoursePage({ params }) {
    const { courseId } = params;
    const course = await getCourse(courseId);

    if (!course) {
        notFound();
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
                        <img 
                            src={course.thumbnailUrl} 
                            alt={course.title} 
                            className="w-full h-full object-cover" 
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
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                                course.status === 'Published' ? 'bg-emerald-100 text-emerald-800' :
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
                        <div dangerouslySetInnerHTML={{ __html: course.description }} />
                    </div>

                    <div className="mt-8 flex gap-4">
                        <Link 
                            href={`/dashboard/courses/${courseId}/edit`}
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

