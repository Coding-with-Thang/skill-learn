"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, BookOpen, FileText, Play, CheckCircle2 } from "lucide-react";
import { cn } from "@skill-learn/lib/utils.js";

/**
 * Infer lesson display type from lesson data (video = play icon, else document; no quiz type in schema).
 */
function getLessonIcon(lesson) {
  if (lesson?.videoUrl) return Play;
  return FileText;
}

/**
 * Read-only course outline for learners: chapters and lessons.
 * Chapters are expandable/collapsible. Lessons show type icon, optional duration/pages/questions, completion checkmark.
 * If courseSlug is provided, lesson titles link to /courses/[courseSlug]/lessons/[lessonSlug].
 * completedLessonIds: optional Set or array of lesson IDs for completion checkmarks and chapter progress.
 */
export default function CourseOutline({
  chapters = [],
  courseSlug: courseSlugProp,
  courseId,
  completedLessonIds = [],
  className,
}) {
  const courseSlug = courseSlugProp ?? courseId;
  const completedSet = useMemo(
    () => (Array.isArray(completedLessonIds) ? new Set(completedLessonIds) : new Set(completedLessonIds || [])),
    [completedLessonIds]
  );

  const sortedChapters = useMemo(
    () =>
      [...(chapters ?? [])].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      ),
    [chapters]
  );

  const chaptersWithSortedLessons = useMemo(
    () =>
      sortedChapters.map((ch) => {
        const sortedLessons = [...(ch.lessons ?? [])].sort(
          (a, b) => (a.position ?? 0) - (b.position ?? 0)
        );
        const completedInChapter = sortedLessons.filter((l) => completedSet.has(l.id)).length;
        return {
          ...ch,
          sortedLessons,
          completedInChapter,
          totalInChapter: sortedLessons.length,
        };
      }),
    [sortedChapters, completedSet]
  );

  const toggleChapter = (chapterId) => {
    setOpenChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const [openChapters, setOpenChapters] = useState({});

  if (sortedChapters.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-muted/30 p-6 text-center text-muted-foreground",
          className
        )}
      >
        <BookOpen className="mx-auto h-10 w-10 opacity-50" />
        <p className="mt-2">This course has no chapters yet.</p>
      </div>
    );
  }

  const totalLessons = chaptersWithSortedLessons.reduce((s, ch) => s + ch.totalInChapter, 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          Course Content
        </h2>
        <span className="text-sm text-muted-foreground shrink-0">
          {totalLessons} {totalLessons === 1 ? "Lesson" : "Lessons"} • {sortedChapters.length} {sortedChapters.length === 1 ? "Chapter" : "Chapters"}
        </span>
      </div>
      <div className="space-y-2">
        {chaptersWithSortedLessons.map((chapter, chapterIndex) => {
          const lessons = chapter.sortedLessons;
          const isOpen = openChapters[chapter.id] === undefined ? chapterIndex === 0 : !!openChapters[chapter.id];
          const completedInChapter = chapter.completedInChapter;
          const totalInChapter = chapter.totalInChapter;
          const progressLabel =
            totalInChapter === 0
              ? "0 LESSONS"
              : completedInChapter >= totalInChapter
                ? `${completedInChapter}/${totalInChapter} COMPLETED`
                : `${completedInChapter}/${totalInChapter} LESSONS`;

          return (
            <div
              key={chapter.id}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                aria-expanded={isOpen}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground"
                  aria-hidden
                >
                  {String(chapterIndex + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0 text-left">
                  <span className="font-semibold text-foreground block">
                    {chapter.title}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {totalInChapter} {totalInChapter === 1 ? "Lesson" : "Lessons"}
                  </span>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
                    completedInChapter >= totalInChapter && totalInChapter > 0
                      ? "bg-[var(--success)] text-[var(--success-foreground)]"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {progressLabel}
                </span>
                <span className="text-muted-foreground shrink-0" aria-hidden>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </span>
              </button>
              {isOpen && lessons.length > 0 && (
                <ul className="border-t border-border bg-muted/20">
                  {lessons.map((lesson, lessonIndex) => {
                    const Icon = getLessonIcon(lesson);
                    const isCompleted = completedSet.has(lesson.id);
                    const lessonHref = courseSlug
                      ? `/courses/${courseSlug}/lessons/${lesson.slug ?? lesson.id}`
                      : null;
                    const content = (
                      <>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-[var(--secondary)]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1 min-w-0 text-foreground">
                          {chapterIndex + 1}.{lessonIndex + 1} {lesson.title}
                        </span>
                        {isCompleted && (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" aria-hidden />
                        )}
                      </>
                    );
                    return (
                      <li key={lesson.id}>
                        {lessonHref ? (
                          <Link
                            href={lessonHref}
                            className="flex items-center gap-3 pl-4 pr-4 py-2.5 text-sm hover:bg-muted/50 border-b border-border/50 last:border-b-0 transition-colors"
                          >
                            {content}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 pl-4 pr-4 py-2.5 text-sm text-muted-foreground border-b border-border/50 last:border-b-0">
                            {content}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
