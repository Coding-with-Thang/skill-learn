"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/navigation";
import { buttonVariants , Button } from "@skill-learn/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@skill-learn/ui/components/form";
import { Input } from "@skill-learn/ui/components/input";
import { Textarea } from "@skill-learn/ui/components/textarea";
import {
  Card,
  CardTitle,
  CardContent,
  CardDescription,
  CardHeader,
} from "@skill-learn/ui/components/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "@skill-learn/lib/utils/axios";
import { Uploader } from "@skill-learn/ui/components/file-uploader";

const TITLE_MAX = 200;

type LessonData = { title?: string; description?: string; thumbnailUrl?: string | null; fileKey?: string | null; videoUrl?: string | null; courseChapter?: { title?: string } };

export default function EditLessonPage() {
  const t = useTranslations("adminLessonEdit");
  const params = useParams();
  const courseId = params.courseId as string;
  const chapterId = params.chapterId as string;
  const lessonId = params.lessonId as string;
  const router = useRouter();

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      thumbnailUrl: "",
      fileKey: "",
      videoUrl: "",
    },
  });

  useEffect(() => {
    const fetchLesson = async () => {
      if (!courseId || !chapterId || !lessonId) return;
      try {
        const res = await api.get(
          `/admin/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`
        );
        const data = res.data?.data?.lesson || res.data?.lesson;
        if (data) {
          setLesson(data);
          form.reset({
            title: data.title ?? "",
            description: data.description ?? "",
            thumbnailUrl: data.thumbnailUrl ?? "",
            fileKey: data.fileKey ?? "",
            videoUrl: data.videoUrl ?? "",
          });
        } else {
          toast.error(t("toastNotFound"));
          router.push(`/dashboard/courses/${courseId}/edit`);
        }
      } catch (err: unknown) {
        console.error(err);
        const e = err as { response?: { data?: { message?: string } } };
        toast.error(e?.response?.data?.message ?? t("toastLoadFailed"));
        router.push(`/dashboard/courses/${courseId}/edit`);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
    // form.reset in effect is intentional; form omitted to avoid effect loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, chapterId, lessonId, router]);

  const onSubmit = async (values: { title?: string; description?: string; thumbnailUrl?: string; fileKey?: string; videoUrl?: string }) => {
    if (!courseId || !chapterId || !lessonId) return;
    setSaving(true);
    try {
      await api.patch(
        `/admin/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
        {
          title: values.title?.trim() || lesson?.title,
          description: values.description ?? lesson?.description,
          thumbnailUrl: values.thumbnailUrl || null,
          fileKey: values.fileKey || null,
          videoUrl: values.videoUrl?.trim() || null,
        }
      );
      toast.success(t("toastSaved"));
      setLesson((prev) => (prev ? { ...prev, ...values } : null));
      router.push(`/dashboard/courses/${courseId}/edit?tab=structure`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { fieldErrors?: { title?: string[] }; error?: string; message?: string } } };
      const msg =
        e?.response?.data?.fieldErrors?.title?.[0] ??
        e?.response?.data?.error ??
        e?.response?.data?.message;
      toast.error(msg || t("toastSaveFailed"));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/courses/${courseId}/edit`}
          className={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("breadcrumb", { chapterTitle: lesson?.courseChapter?.title ?? t("chapter"), lessonTitle: lesson?.title ?? t("lesson") })}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("lessonContent")}</CardTitle>
          <CardDescription>
            {t("lessonContentDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                rules={{
                  required: t("titleRequired"),
                  maxLength: {
                    value: TITLE_MAX,
                    message: t("titleMaxLength", { max: TITLE_MAX }),
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("titleLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("titlePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("descriptionLabel")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("descriptionPlaceholder")}
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("thumbnailImageLabel")}</FormLabel>
                    <FormControl>
                      <Uploader
                        onChange={field.onChange}
                        value={field.value}
                        name={field.name}
                        api={api}
                        mediaListEndpoint="/api/admin/media"
                        onUploadComplete={(upload) => {
                          form.setValue(
                            "fileKey",
                            upload?.path || "",
                            { shouldValidate: true }
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("videoUrlLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder={t("videoUrlPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    {t("saveLesson")}
                  </>
                )}
                </Button>
                <Link
                  href={`/dashboard/courses/${courseId}/edit`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  {t("backToCourse")}
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
