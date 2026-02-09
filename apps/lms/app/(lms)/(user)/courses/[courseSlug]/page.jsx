"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, Play } from "lucide-react";
import { FeatureGate, FeatureDisabledPage } from "@skill-learn/ui/components/feature-gate";
import { buttonVariants } from "@skill-learn/ui/components/button";
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import CourseOutline from "@/components/courses/CourseOutline";
import { Loader } from "@skill-learn/ui/components/loader";
import { extractTextFromProseMirror } from "@skill-learn/lib/utils.js";
import api from "@skill-learn/lib/utils/axios.js";

function lessonSlugOrId(lesson) {
  return lesson?.slug ?? lesson?.id;
}

function getFirstLessonSlug(chapters) {
  if (!Array.isArray(chapters) || chapters.length === 0) return null;
  const sorted = [...chapters].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  for (const ch of sorted) {
    const lessons = [...(ch.lessons ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    if (lessons.length > 0) return lessonSlugOrId(lessons[0]);
  }
  return null;
}

function getFirstIncompleteLessonSlug(chapters, completedLessonIds) {
  const set = new Set(completedLessonIds ?? []);
  if (!Array.isArray(chapters)) return null;
  const sorted = [...chapters].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  for (const ch of sorted) {
    const lessons = [...(ch.lessons ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    for (const l of lessons) {
      if (!set.has(l.id)) return lessonSlugOrId(l);
    }
  }
  return null;
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params?.courseSlug;

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const courseSlugForLinks = course?.slug ?? course?.id ?? courseSlug;
  const firstLessonSlug = useMemo(() => getFirstLessonSlug(course?.chapters ?? []), [course?.chapters]);
  const firstIncompleteSlug = useMemo(
    () => getFirstIncompleteLessonSlug(course?.chapters ?? [], progress?.completedLessonIds ?? []),
    [course?.chapters, progress?.completedLessonIds]
  );
  const startOrContinueHref =
    firstIncompleteSlug
      ? `/courses/${courseSlugForLinks}/lessons/${firstIncompleteSlug}`
      : firstLessonSlug
        ? `/courses/${courseSlugForLinks}/lessons/${firstLessonSlug}`
        : null;
  const isCourseCompleted = !!progress?.courseCompleted;

  useEffect(() => {
    if (!courseSlug) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get(`/courses/${courseSlug}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        const c = data?.course ?? res.data?.course;
        if (c) setCourse(c);
        else setError("Course not found");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setError("Course not found");
          return;
        }
        if (err?.response?.status === 401) {
          router.push("/sign-in");
          return;
        }
        setError(err?.response?.data?.message || "Failed to load course");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [courseSlug, router]);

  useEffect(() => {
    if (!course || !course.id) return;
    api
      .get(`/user/courses/${course.id}/progress`)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setProgress(data ?? null);
      })
      .catch(() => setProgress(null));
  }, [course?.id, course]);

  if (!courseSlug) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Invalid course
      </div>
    );
  }

  return (
    <FeatureGate
      feature="training_courses"
      featureName="Training Courses"
      fallback={<FeatureDisabledPage featureName="Training Courses" />}
    >
      <div className="min-h-screen">
        <div className="px-4 sm:px-8 md:px-12 py-6">
          <BreadCrumbCom
            crumbs={[{ name: "Training", href: "/training" }]}
            endtrail={loading ? "Course" : course?.title ?? "Course"}
          />

          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader />
              <p className="mt-4 text-muted-foreground">Loading course...</p>
            </div>
          )}

          {error && !loading && (
            <div className="max-w-2xl mx-auto py-12 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Link
                href="/training"
                className={buttonVariants({ variant: "outline" })}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Training
              </Link>
            </div>
          )}

          {course && !loading && (
            <>
              <div className="mt-4 mb-6">
                <Link
                  href="/training"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Training
                </Link>
              </div>

              <article className="max-w-4xl mx-auto">
                {/* Hero */}
                <header className="rounded-xl border border-border bg-card overflow-hidden mb-8">
                  <div className="relative w-full aspect-video max-h-[320px] bg-muted">
                    <Image
                      src={course.imageUrl || "/placeholder-course.jpg"}
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 1024px"
                      priority
                    />
                  </div>
                  <div className="p-6 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                      {course.title}
                    </h1>
                    {course.excerptDescription && (
                      <p className="text-muted-foreground text-lg mb-4">
                        {course.excerptDescription}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {course.category?.name && (
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          {course.category.name}
                        </span>
                      )}
                      {(course.duration != null || course.duration === 0) && (
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {course.duration >= 60
                            ? `${Math.floor(course.duration / 60)}h ${course.duration % 60 ? `${course.duration % 60}m` : ""}`.trim()
                            : `${course.duration} min`}
                        </span>
                      )}
                    </div>
                    {startOrContinueHref && (
                      <div className="mt-4">
                        <Link
                          href={startOrContinueHref}
                          className={buttonVariants({ size: "lg" }) + " gap-2"}
                        >
                          <Play className="h-5 w-5" />
                          {isCourseCompleted
                            ? "Review course"
                            : firstIncompleteSlug
                              ? "Continue"
                              : "Start course"}
                        </Link>
                      </div>
                    )}
                  </div>
                </header>

                {/* Description */}
                {course.description && (
                  <section className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-3">
                      About this course
                    </h2>
                    <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                      <p className="whitespace-pre-wrap">
                        {extractTextFromProseMirror(course.description) ||
                          course.excerptDescription ||
                          "No description available."}
                      </p>
                    </div>
                  </section>
                )}

                {/* Course structure: chapters and lessons */}
                <section>
                  <CourseOutline chapters={course.chapters} courseSlug={courseSlugForLinks} />
                </section>
              </article>
            </>
          )}
        </div>
      </div>
    </FeatureGate>
  );
}
