"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Label } from "@skill-learn/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@skill-learn/ui/components/select";
import { Loader } from "@skill-learn/ui/components/loader";
import { Sliders, Settings2 } from "lucide-react";
import api from "@skill-learn/lib/utils/axios";
import { toast } from "sonner";

const OVERRIDE_MODE_KEYS: Record<string, { labelKey: string; descKey: string }> = {
  USER_OVERRIDES_ADMIN: { labelKey: "overrideUserOverridesAdmin", descKey: "overrideUserOverridesAdminDesc" },
  ADMIN_OVERRIDES_USER: { labelKey: "overrideAdminOverridesUser", descKey: "overrideAdminOverridesUserDesc" },
  ADMIN_ONLY: { labelKey: "overrideAdminOnly", descKey: "overrideAdminOnlyDesc" },
  USER_ONLY: { labelKey: "overrideUserOnly", descKey: "overrideUserOnlyDesc" },
};

type CategoryItem = { id: string; name: string; cardCount?: number; priority?: number };

export default function FlashCardsPrioritiesPage() {
  const t = useTranslations("adminFlashcardsPriorities");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [overrideMode, setOverrideMode] = useState("USER_OVERRIDES_ADMIN");
  const [loading, setLoading] = useState(true);
  const [savingPriority, setSavingPriority] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prioritiesRes, settingsRes] = await Promise.all([
        api.get("/admin/flashcards/priorities"),
        api.get("/admin/flashcards/settings"),
      ]);
      const prioritiesData = prioritiesRes.data?.data ?? prioritiesRes.data;
      const settingsData = settingsRes.data?.data ?? settingsRes.data;
      setCategories((prioritiesData.categories ?? []) as CategoryItem[]);
      setOverrideMode(
        settingsData.settings?.overrideMode ?? "USER_OVERRIDES_ADMIN"
      );
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("toastLoadFailed"));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (categoryId: string, newPriority: number, previousPriority: number) => {
    try {
      setSavingPriority(categoryId);
      await api.post("/admin/flashcards/priorities", {
        categoryId,
        priority: newPriority,
      });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId ? { ...c, priority: newPriority } : c
        )
      );
      toast.success(t("toastPriorityUpdated"));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("toastUpdatePriorityFailed"));
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId ? { ...c, priority: previousPriority } : c
        )
      );
    } finally {
      setSavingPriority(null);
    }
  };

  const handleOverrideModeChange = async (value: string) => {
    try {
      setSavingSettings(true);
      await api.patch("/admin/flashcards/settings", { overrideMode: value });
      setOverrideMode(value);
      toast.success(t("toastOverrideModeUpdated"));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("toastUpdateSettingsFailed"));
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("description")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            {t("overrideMode")}
          </CardTitle>
          <CardDescription>
            {t("overrideDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label>{t("priorityResolution")}</Label>
            <Select
              value={overrideMode}
              onValueChange={handleOverrideModeChange}
              disabled={savingSettings}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(OVERRIDE_MODE_KEYS).map(([value, { labelKey }]) => (
                  <SelectItem key={value} value={value}>
                    {t(labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            {t("categoryPriorities")}
          </CardTitle>
          <CardDescription>
            {t("prioritiesDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader variant="gif" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t("noCategories")}</p>
              <p className="text-sm mt-1">
                {t("categoriesHint")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate block">{c.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {t("cardsCount", { count: c.cardCount ?? 0 })}
                    </span>
                  </div>
                  <Select
                    value={String(c.priority)}
                    onValueChange={(v) => {
                      const num = Number(v);
                      const previousPriority = c.priority;
                      setCategories((prev) =>
                        prev.map((cat) =>
                          cat.id === c.id ? { ...cat, priority: num } : cat
                        )
                      );
                      handlePriorityChange(c.id, num, previousPriority ?? 1);
                    }}
                    disabled={savingPriority === c.id}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
