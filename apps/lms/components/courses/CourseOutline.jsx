"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, BookOpen, FileText } from "lucide-react";
import { cn } from "@skill-learn/lib/utils.js";

/**
 * Read-only course outline for learners: chapters and lessons.
 * Chapters are expandable/collapsible. Lessons are listed under each chapter.
 */
export default function CourseOutline({ chapters = [], className }) {
  const [openChapters, setOpenChapters] = useState({});

  const sortedChapters = useMemo(
    () =>
      [...(chapters ?? [])].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      ),
    [chapters]
  );

  const toggleChapter = (chapterId) => {
    setOpenChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

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

  const chaptersWithSortedLessons = useMemo(
    () =>
      sortedChapters.map((ch) => ({
        ...ch,
        sortedLessons: [...(ch.lessons ?? [])].sort(
          (a, b) => (a.position ?? 0) - (b.position ?? 0)
        ),
      })),
    [sortedChapters]
  );

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Course content
      </h3>
      {chaptersWithSortedLessons.map((chapter, chapterIndex) => {
        const lessons = chapter.sortedLessons;
        const isOpen = openChapters[chapter.id] !== false;

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
              <span className="text-muted-foreground shrink-0" aria-hidden>
                {isOpen ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </span>
              <span className="font-medium text-foreground flex-1">
                {chapterIndex + 1}. {chapter.title}
              </span>
              <span className="text-sm text-muted-foreground shrink-0">
                {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
              </span>
            </button>
            {isOpen && lessons.length > 0 && (
              <ul className="border-t border-border bg-muted/20">
                {lessons.map((lesson, lessonIndex) => (
                  <li key={lesson.id}>
                    <div className="flex items-center gap-3 pl-4 pr-4 py-2.5 text-sm text-muted-foreground border-b border-border/50 last:border-b-0">
                      <FileText className="h-4 w-4 shrink-0 opacity-70" />
                      <span className="flex-1">
                        {chapterIndex + 1}.{lessonIndex + 1} {lesson.title}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
