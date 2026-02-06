"use client";

import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
} from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { useState, useMemo, useEffect } from "react";
import { GripVertical, ChevronDown, ChevronRight, Trash2, Plus } from "lucide-react";

function arrayMove(items, fromIndex, toIndex) {
  const arr = [...items];
  const [removed] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, removed);
  return arr;
}

export default function CourseStructure({
  course,
  courseId,
  mutationPending = false,
  onDeleteChapter,
  onAddChapter,
  onReorderChapters,
  onAddLesson,
  onDeleteLesson,
  onReorderLessons,
}) {
  const chapters = course?.chapters ?? [];
  const [openChapters, setOpenChapters] = useState({});

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function SortableLessonItem({ lesson, chapterId, onDelete, disabled }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: lesson.id, data: { type: "Lesson", lesson, chapterId }, disabled });

    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
    };

    return (
      <li
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-2 py-1.5 pl-8 pr-2 text-sm text-muted-foreground rounded touch-none ${isDragging ? "z-10 bg-background shadow" : ""}`}
      >
        <button
          type="button"
          className="cursor-grab touch-none p-0.5 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder lesson"
          disabled={disabled}
        >
          <GripVertical className="size-4" />
        </button>
        <span className="flex-1 truncate">{lesson.title}</span>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onDelete(chapterId, lesson);
            }}
            className="text-muted-foreground hover:text-destructive p-0.5 shrink-0 disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Delete lesson"
            disabled={disabled}
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </li>
    );
  }

  function SortableChapterItem({ chapter, isOpen, onToggle, onDelete, disabled }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: chapter.id, data: { type: "Chapter", chapter }, disabled });

    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
    };

    const lessons = useMemo(
      () =>
        (chapter.lessons ?? [])
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
      [chapter.lessons]
    );
    const lessonIds = useMemo(() => lessons.map((l) => l.id), [lessons]);

    const handleLessonDragEnd = (event) => {
      if (disabled) return;
      const { active, over } = event;
      if (!over || active.id === over.id || !onReorderLessons) return;
      const oldIndex = lessonIds.indexOf(active.id);
      const newIndex = lessonIds.indexOf(over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newOrder = arrayMove(lessons, oldIndex, newIndex);
      onReorderLessons(chapter.id, newOrder.map((l) => l.id));
    };

    const lessonSensors = useSensors(
      useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
      useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
      useSensor(KeyboardSensor)
    );

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`touch-none rounded-md border border-border ${isDragging ? "z-10 bg-background shadow" : ""}`}
      >
        <div className="flex items-center gap-2 p-3">
          <button
            type="button"
            className="cursor-grab touch-none p-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder chapter"
            disabled={disabled}
          >
            <GripVertical className="size-4" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground p-0.5"
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
          <span className="font-medium flex-1 truncate">{chapter.title}</span>
          <span className="text-sm text-muted-foreground shrink-0">
            {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onDelete(chapter);
              }}
              className="text-muted-foreground hover:text-destructive p-0.5 shrink-0 disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Delete chapter"
              disabled={disabled}
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
        {isOpen && (
          <div className="border-t border-border bg-muted/30 px-3 py-2">
            {lessons.length > 0 ? (
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleLessonDragEnd}
                sensors={lessonSensors}
              >
                <SortableContext
                  strategy={verticalListSortingStrategy}
                  items={lessonIds}
                >
                  <ul className="space-y-0.5">
                    {lessons.map((lesson) => (
                      <SortableLessonItem
                        key={lesson.id}
                        lesson={lesson}
                        chapterId={chapter.id}
                        onDelete={onDeleteLesson}
                        disabled={disabled}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            ) : null}
            {onAddLesson && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 w-full justify-start text-muted-foreground"
                onClick={() => onAddLesson(chapter.id)}
                disabled={disabled}
              >
                <Plus className="size-4 mr-1" />
                Add lesson
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  useEffect(() => {
    if (chapters.length > 0) {
      setOpenChapters((prev) => {
        const next = { ...prev };
        chapters.forEach((ch) => {
          if (next[ch.id] === undefined) next[ch.id] = true;
        });
        return next;
      });
    }
  }, [chapters]);

  const chapterIds = useMemo(() => chapters.map((ch) => ch.id), [chapters]);

  const handleChapterDragEnd = (event) => {
    if (mutationPending) return;
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorderChapters) return;
    const oldIndex = chapterIds.indexOf(active.id);
    const newIndex = chapterIds.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(chapters, oldIndex, newIndex);
    onReorderChapters(newOrder.map((c) => c.id));
  };

  const toggleChapter = (chapterId) => {
    setOpenChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  if (chapters.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle>Chapters</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground space-y-4">
          <p>No chapters yet. Add a chapter to build your course structure.</p>
          {onAddChapter && (
            <Button type="button" onClick={onAddChapter} disabled={mutationPending}>
              <Plus className="size-4 mr-2" />
              Add chapter
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border">
        <CardTitle>Chapters</CardTitle>
        {onAddChapter && (
          <Button type="button" variant="outline" size="sm" onClick={onAddChapter} disabled={mutationPending}>
            <Plus className="size-4 mr-1" />
            Add chapter
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleChapterDragEnd}
          sensors={sensors}
        >
          <SortableContext
            strategy={verticalListSortingStrategy}
            items={chapterIds}
          >
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <SortableChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  isOpen={openChapters[chapter.id] ?? true}
                  onToggle={() => toggleChapter(chapter.id)}
                  onDelete={onDeleteChapter}
                  disabled={mutationPending}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
