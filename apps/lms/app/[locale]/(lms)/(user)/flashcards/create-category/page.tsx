"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import api from "@skill-learn/lib/utils/axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Input } from "@skill-learn/ui/components/input";
import { Label } from "@skill-learn/ui/components/label";
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import { toast } from "sonner";

export default function CreateFlashCardCategoryPage() {
  const t = useTranslations("flashcards");
  const tB = useTranslations("breadcrumbs");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    setSaving(true);
    try {
      await api.post("/flashcards/categories", { name: name.trim() });
      toast.success(t("categoryCreated"));
      router.push("/flashcards");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("failedToCreateCategory"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <BreadCrumbCom
        crumbs={[
          { name: tB("flashCards"), href: "/flashcards" },
          { name: tB("createCategory"), href: "/flashcards/create-category" },
        ]}
        endtrail={tB("createCategory")}
      />
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("createCategory")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("organizeFlashCards")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("newCategory")}</CardTitle>
            <CardDescription>{t("nameForCategory")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("placeholderCategory")}
                  className="mt-1"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? t("creating") : t("createCategoryButton")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/flashcards")}
                >
                  {t("cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
