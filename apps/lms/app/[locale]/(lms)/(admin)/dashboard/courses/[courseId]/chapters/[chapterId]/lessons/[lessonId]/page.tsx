"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { buttonVariants , Button } from "@skill-learn/ui/components/button";
import { Card, CardTitle, CardContent, CardDescription, CardHeader } from "@skill-learn/ui/components/card";
import { Input } from "@skill-learn/ui/components/input";
import { Textarea } from "@skill-learn/ui/components/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import api from "@skill-learn/lib/utils/axios";

type LessonShape = { title?: string; description?: string; videoUrl?: string; thumbnailUrl?: string; [key: string]: unknown };

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const chapterId = params.chapterId as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<LessonShape | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
  });

  useEffect(() => {
    if (!courseId || !chapterId || !lessonId) return;
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          `/admin/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`
        );
        const lessonData = data?.data?.lesson ?? data?.lesson;
        if (!lessonData) {
          toast.error("Lesson not found");
          router.push(`/dashboard/courses/${courseId}/edit`);
          return;
        }
        setLesson(lessonData);
        setForm({
          title: lessonData.title ?? "",
          description: lessonData.description ?? "",
          videoUrl: lessonData.videoUrl ?? "",
          thumbnailUrl: lessonData.thumbnailUrl ?? "",
        });
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        toast.error(e?.response?.data?.message || "Failed to load lesson");
        router.push(`/dashboard/courses/${courseId}/edit`);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [courseId, chapterId, lessonId, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lesson) return;
    setSaving(true);
    try {
      await api.patch(
        `/admin/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
        {
          title: form.title.trim(),
          description: form.description.trim() || null,
          videoUrl: form.videoUrl.trim() || null,
          thumbnailUrl: form.thumbnailUrl.trim() || null,
        }
      );
      toast.success("Lesson saved");
      setLesson((prev) => (prev ? { ...prev, ...form } : { ...form }));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || "Failed to save lesson");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/dashboard/courses/${courseId}/edit`}
          className={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Lesson</h1>
          <p className="text-sm text-muted-foreground">
            Course → Chapter → {lesson.title}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lesson content</CardTitle>
          <CardDescription>
            Set the title, description, and media for this lesson. Learners will see this when they open the lesson.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="lesson-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="lesson-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Lesson title"
                required
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {form.title.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="lesson-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="lesson-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What will learners cover in this lesson?"
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lesson-video" className="text-sm font-medium">
                Video URL
              </label>
              <Input
                id="lesson-video"
                type="url"
                value={form.videoUrl}
                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                Optional. Link to a video (e.g. YouTube, Vimeo, or hosted URL).
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="lesson-thumbnail" className="text-sm font-medium">
                Thumbnail URL
              </label>
              <Input
                id="lesson-thumbnail"
                type="url"
                value={form.thumbnailUrl}
                onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                Optional. Image URL for the lesson card.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Save lesson
                  </>
                )}
              </Button>
              <Link
                href={`/dashboard/courses/${courseId}/edit`}
                className={buttonVariants({ variant: "outline" })}
              >
                Back to course
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
