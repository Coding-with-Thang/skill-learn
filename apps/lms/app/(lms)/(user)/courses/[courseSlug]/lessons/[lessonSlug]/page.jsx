"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  List,
  Loader2,
} from "lucide-react";
import { FeatureGate, FeatureDisabledPage } from "@skill-learn/ui/components/feature-gate";
import { Button } from "@skill-learn/ui/components/button";
import { cn } from "@skill-learn/lib/utils.js";
import api from "@skill-learn/lib/utils/axios.js";
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import LessonVideoPlayer from "@/components/courses/LessonVideoPlayer";
import { Loader } from "@skill-learn/ui/components/loader";

function getAllLessons(chapters) {
  if (!Array.isArray(chapters)) return [];
  const sorted = [...chapters].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return sorted.flatMap((ch) => {
    const lessons = [...(ch.lessons ?? [])].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    );
    return lessons.map((l) => ({ ...l, chapterId: ch.id, chapterTitle: ch.title }));
  });
}

function lessonSlugOrId(l) {
  return l?.slug ?? l?.id;
}

function getPrevNext(flatLessons, currentLesson) {
  if (!currentLesson) return { prev: null, next: null };
  const idx = flatLessons.findIndex((l) => l.id === currentLesson.id);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? flatLessons[idx - 1] : null,
    next: idx < flatLessons.length - 1 ? flatLessons[idx + 1] : null,
  };
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params?.courseSlug;
  const lessonSlug = params?.lessonSlug;

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completingCourse, setCompletingCourse] = useState(false);

  const flatLessons = useMemo(() => getAllLessons(course?.chapters ?? []), [course?.chapters]);
  const currentLesson = useMemo(
    () => flatLessons.find((l) => (l.slug ?? l.id) === lessonSlug),
    [flatLessons, lessonSlug]
  );
  const { prev, next } = useMemo(
    () => getPrevNext(flatLessons, currentLesson),
    [flatLessons, currentLesson]
  );
  const courseSlugForLinks = course?.slug ?? course?.id ?? courseSlug;
  const totalLessons = flatLessons.length;
  const completedCount = progress?.completedLessonIds?.length ?? 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const allLessonsCompleted = totalLessons > 0 && completedCount >= totalLessons;
  const isLastLesson = next === null && totalLessons > 0;
  const showCompleteButton =
    (isLastLesson || allLessonsCompleted) && !progress?.courseCompleted;

  const fetchCourse = useCallback(async () => {
    if (!courseSlug) return;
    try {
      const res = await api.get(`/courses/${courseSlug}`);
      const data = res.data?.data ?? res.data;
      const c = data?.course ?? res.data?.course;
      setCourse(c || null);
    } catch (e) {
      if (e?.response?.status === 404) setCourse(null);
      else console.error(e);
    }
  }, [courseSlug]);

  const fetchProgress = useCallback(async () => {
    if (!course?.id) return;
    try {
      const res = await api.get(`/user/courses/${course.id}/progress`);
      const data = res.data?.data ?? res.data;
      setProgress(data ?? null);
    } catch (e) {
      setProgress(null);
    }
  }, [course?.id]);

  useEffect(() => {
    if (!courseSlug || !lessonSlug) return;
    let cancelled = false;
    setLoading(true);
    api.get(`/courses/${courseSlug}`).then((r) => {
      if (cancelled) return;
      const d = r.data?.data ?? r.data;
      const c = d?.course ?? r.data?.course ?? null;
      setCourse(c || null);
      if (c?.id) {
        return api.get(`/user/courses/${c.id}/progress`).then((pr) => {
          if (cancelled) return;
          const pd = pr.data?.data ?? pr.data;
          setProgress(pd ?? null);
        }).catch(() => { if (!cancelled) setProgress(null); });
      }
    }).catch(() => {}).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [courseSlug, lessonSlug]);

  useEffect(() => {
    if (!course?.id) return;
    api.get(`/user/courses/${course.id}/progress`).then((r) => {
      const d = r.data?.data ?? r.data;
      setProgress(d ?? null);
    }).catch(() => setProgress(null));
  }, [course?.id]);

  const markLessonComplete = useCallback(async () => {
    if (!course?.id || !currentLesson?.id) return;
    try {
      await api.post(`/user/courses/${course.id}/lessons/${currentLesson.id}/complete`);
      await fetchProgress();
    } catch (e) {
      console.error("Failed to mark lesson complete", e);
    }
  }, [course?.id, currentLesson?.id, fetchProgress]);

  const handleVideoEnded = useCallback(() => {
    markLessonComplete();
  }, [markLessonComplete]);

  const handleCompleteCourse = useCallback(async () => {
    if (!course?.id) return;
    setCompletingCourse(true);
    try {
      await api.post(`/user/courses/${course.id}/complete`);
      await fetchProgress();
    } catch (e) {
      console.error("Failed to complete course", e);
    } finally {
      setCompletingCourse(false);
    }
  }, [course?.id, fetchProgress]);

  const goPrev = useCallback(() => {
    if (prev) router.push(`/courses/${courseSlugForLinks}/lessons/${lessonSlugOrId(prev)}`);
  }, [prev, courseSlugForLinks, router]);

  const goNext = useCallback(() => {
    if (next) {
      markLessonComplete();
      router.push(`/courses/${courseSlugForLinks}/lessons/${lessonSlugOrId(next)}`);
    }
  }, [next, courseSlugForLinks, router, markLessonComplete]);

  if (!courseSlug || !lessonSlug) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Invalid course or lesson
      </div>
    );
  }

  return (
    <FeatureGate
      feature="training_courses"
      featureName="Training Courses"
      fallback={<FeatureDisabledPage featureName="Training Courses" />}
    >
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Side panel - chapters & lessons */}
        <aside
          className={cn(
            "border-r border-border bg-card flex flex-col w-full lg:w-72 shrink-0 transition-transform duration-200 z-2000",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-14"
          )}
        >
          <div className="p-3 border-b border-border flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="p-2 rounded-4xld hover:bg-muted text-muted-foreground"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <List className="h-5 w-5" />
            </button>
            {sidebarOpen && (
              <span className="text-sm font-medium truncate flex-1 mx-2" title={course?.title}>
                {course?.title}
              </span>
            )}
          </div>
          {sidebarOpen && (
            <nav className="flex-1 overflow-y-auto p-3">
              {course?.chapters
                ?.slice()
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((chapter) => {
                  const lessons = [...(chapter.lessons ?? [])].sort(
                    (a, b) => (a.position ?? 0) - (b.position ?? 0)
                  );
                  const completedIds = progress?.completedLessonIds ?? [];
                  return (
                    <div key={chapter.id} className="mb-4">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                        {chapter.title}
                      </div>
                      <ul className="space-y-0.5">
                        {lessons.map((lesson) => {
                          const isCurrent = lesson.id === currentLesson?.id;
                          const completed = completedIds.includes(lesson.id);
                          return (
                            <li key={lesson.id}>
                              <Link
                                href={`/courses/${courseSlugForLinks}/lessons/${lessonSlugOrId(lesson)}`}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-4xld text-sm transition-colors",
                                  isCurrent
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                  completed && !isCurrent && "text-green-600 dark:text-green-400"
                                )}
                              >
                                {completed ? (
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                                ) : (
                                  <span className="w-4 h-4 shrink-0 rounded-full border border-current opacity-50" />
                                )}
                                <span className="truncate">{lesson.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
            </nav>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="border-b border-border px-4 py-2 flex items-center gap-4 flex-wrap">
            <BreadCrumbCom
              crumbs={[
                { name: "Training", href: "/training" },
                { name: course?.title ?? "Course", href: `/courses/${courseSlugForLinks}` },
              ]}
              endtrail={currentLesson?.title ?? "Lesson"}
            />
            <Link
              href={`/courses/${courseSlugForLinks}`}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to course
            </Link>
          </div>

          {/* Progress bar */}
          {totalLessons > 0 && (
            <div className="px-4 py-2 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                <span>
                  {completedCount} of {totalLessons} lessons completed
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-teal transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <Loader />
            </div>
          ) : !course ? (
            <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">
              Course not found
            </div>
          ) : !currentLesson ? (
            <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">
              Lesson not found
            </div>
          ) : (
            <div className="flex-1 p-4 md:p-6 flex flex-col">
              <h1 className="text-xl font-semibold text-foreground mb-4">
                {currentLesson.title}
              </h1>

              <div className="flex-1 min-h-0">
                <LessonVideoPlayer
                  src={currentLesson.videoUrl}
                  className="max-w-4xl"
                  onEnded={handleVideoEnded}
                />
              </div>

              {/* Next / Previous */}
              <div className="flex items-center justify-between gap-4 mt-6 max-w-4xl">
                <Button
                  variant="outline"
                  onClick={goPrev}
                  disabled={!prev}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {next ? (
                  <Button onClick={goNext} className="gap-2">
                    Next lesson
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : showCompleteButton ? (
                  <Button
                    onClick={handleCompleteCourse}
                    disabled={completingCourse}
                    className="gap-2"
                  >
                    {completingCourse ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Complete course
                  </Button>
                ) : progress?.courseCompleted ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle2 className="h-5 w-5" />
                    Course completed
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Watch the video to mark this lesson complete
                  </span>
                )}
              </div>

              {/* Complete course block when all done but not yet marked */}
              {allLessonsCompleted && showCompleteButton && (
                <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30 max-w-4xl">
                  <p className="text-sm text-muted-foreground mb-2">
                    You&apos;ve watched all lessons. Mark this course as complete to track your
                    achievement.
                  </p>
                  <Button onClick={handleCompleteCourse} disabled={completingCourse} className="gap-2">
                    {completingCourse ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Complete course
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </FeatureGate>
  );
}
