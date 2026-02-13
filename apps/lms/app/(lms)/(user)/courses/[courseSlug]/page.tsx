"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Play, Star, CheckCircle2, Zap } from "lucide-react";
import { FeatureGate, FeatureDisabledPage } from "@skill-learn/ui/components/feature-gate";
import { buttonVariants } from "@skill-learn/ui/components/button";
import { Progress } from "@skill-learn/ui/components/progress";
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import CourseOutline from "@/components/courses/CourseOutline";
import { Loader } from "@skill-learn/ui/components/loader";
import { extractTextFromProseMirror, cn } from "@skill-learn/lib/utils";
import api from "@skill-learn/lib/utils/axios";

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

function getNextLessonLabel(chapters, targetSlugOrId) {
  if (!targetSlugOrId || !Array.isArray(chapters)) return null;
  const sorted = [...chapters].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  for (let ci = 0; ci < sorted.length; ci++) {
    const lessons = [...(sorted[ci].lessons ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    for (let li = 0; li < lessons.length; li++) {
      if ((lessons[li].slug ?? lessons[li].id) === targetSlugOrId) {
        return `${ci + 1}.${li + 1} ${lessons[li].title}`;
      }
    }
  }
  return null;
}

function formatDuration(minutes) {
  if (minutes == null) return null;
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes} min`;
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
  const nextLessonLabel = useMemo(
    () => getNextLessonLabel(course?.chapters ?? [], firstIncompleteSlug ?? firstLessonSlug),
    [course?.chapters, firstIncompleteSlug, firstLessonSlug]
  );
  const progressPercent = progress?.progressPercent ?? 0;

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
              <div className="mt-4 mb-2">
                <Link
                  href="/training"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Training
                </Link>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mt-6">
                {/* Left content column */}
                <article className="flex-1 min-w-0 max-w-3xl">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {course.title}
                  </h1>
                  {course.excerptDescription && (
                    <p className="text-muted-foreground text-base mb-4">
                      {course.excerptDescription}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                    {course.duration != null && (
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        {formatDuration(course.duration)} Total
                      </span>
                    )}
                    <span className="flex items-center gap-2">
                      <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                      4.9 (2.1k reviews)
                    </span>
                  </div>

                  <section className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-3">
                      About this course
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {extractTextFromProseMirror(course.description) ||
                        course.excerptDescription ||
                        "This comprehensive curriculum is designed for professionals looking to enhance their skills."}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      {[
                        "Master key concepts and techniques",
                        "Apply practical frameworks immediately",
                        "Build confidence through practice",
                        "Track your progress and outcomes",
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-(--success)" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <CourseOutline
                      chapters={course.chapters}
                      courseSlug={courseSlugForLinks}
                      completedLessonIds={progress?.completedLessonIds ?? []}
                    />
                  </section>
                </article>

                {/* Right sticky column */}
                <aside className="w-full lg:w-[320px] shrink-0">
                  <div className="lg:sticky lg:top-6 space-y-4">
                    {/* Course preview card */}
                    <div className="rounded-xl border border-border bg-card shadow-theme-md overflow-hidden">
                      <div className="relative aspect-video bg-muted">
                        <span className="absolute left-3 top-3 rounded-md bg-(--success) px-2 py-0.5 text-xs font-medium text-(--success-foreground)">
                          PREVIEW AVAILABLE
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-secondary shadow-theme">
                            <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                        <Image
                          src={course.imageUrl || "/placeholder-course.jpg"}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="320px"
                        />
                      </div>
                      <div className="p-4">
                        {startOrContinueHref && (
                          <Link
                            href={startOrContinueHref}
                            className={cn(
                              "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-95",
                              "bg-linear-to-r from-secondary to-info"
                            )}
                          >
                            {isCourseCompleted
                              ? "Review course"
                              : firstIncompleteSlug
                                ? "Continue Learning"
                                : "Start course"}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                        {nextLessonLabel && (
                          <p className="mt-3 text-xs text-muted-foreground text-center">
                            Next Lesson: {nextLessonLabel}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress card */}
                    <div className="rounded-xl border border-border bg-card shadow-theme-md p-4">
                      <div className="flex items-baseline justify-between mb-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          Course Progress
                        </h3>
                        <span className="text-sm font-medium text-foreground">
                          {progressPercent}%
                        </span>
                      </div>
                      <Progress
                        value={progressPercent}
                        className="h-2 rounded-full"
                        indicatorClassName="bg-gradient-to-r from-[var(--secondary)] to-[var(--info)] rounded-full"
                      />
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Zap className="h-3.5 w-3.5 shrink-0" />
                        Last active —
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </div>
    </FeatureGate>
  );
}
