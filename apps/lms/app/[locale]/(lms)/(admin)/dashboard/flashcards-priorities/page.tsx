"use client";

import { useState, useEffect } from "react";
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

const OVERRIDE_MODES = [
  {
    value: "USER_OVERRIDES_ADMIN",
    label: "User overrides admin",
    description: "User priorities take precedence when set",
  },
  {
    value: "ADMIN_OVERRIDES_USER",
    label: "Admin overrides user",
    description: "Admin priorities always win",
  },
  {
    value: "ADMIN_ONLY",
    label: "Admin only",
    description: "User priorities are ignored",
  },
  {
    value: "USER_ONLY",
    label: "User only",
    description: "Admin priorities are ignored",
  },
];

type CategoryItem = { id: string; name: string; cardCount?: number; priority?: number };

export default function FlashCardsPrioritiesPage() {
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
      toast.error(e.response?.data?.error || "Failed to load data");
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
      toast.success("Priority updated");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || "Failed to update priority");
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
      toast.success("Override mode updated");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || "Failed to update settings");
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
        <h1 className="text-2xl font-bold">Flash Card Priorities</h1>
        <p className="text-muted-foreground mt-1">
          Set category priorities (1–10) and override mode. Higher priority categories appear more often in study sessions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Override Mode
          </CardTitle>
          <CardDescription>
            How admin and user priorities are combined when both are set
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label>Priority resolution</Label>
            <Select
              value={overrideMode}
              onValueChange={handleOverrideModeChange}
              disabled={savingSettings}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OVERRIDE_MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
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
            Category Priorities
          </CardTitle>
          <CardDescription>
            1 = lowest, 10 = highest. Categories with higher priority are shown more often.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader variant="gif" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No flash card categories yet.</p>
              <p className="text-sm mt-1">
                Categories are created when users add flash cards.
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
                      {c.cardCount} card{c.cardCount !== 1 ? "s" : ""}
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
