"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@skill-learn/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@skill-learn/ui/components/select";
import { Loader } from "@skill-learn/ui/components/loader";
import { Sliders } from "lucide-react";
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import api from "@skill-learn/lib/utils/axios";
import { toast } from "sonner";

type PriorityCategory = { id: string; name?: string; cardCount?: number; priority: number };

export default function FlashCardPrioritiesPage() {
  const t = useTranslations("flashcards");
  const tB = useTranslations("breadcrumbs");
  const [categories, setCategories] = useState<PriorityCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPriority, setSavingPriority] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/flashcards/priorities");
      const data = res.data?.data ?? res.data;
      setCategories(data.categories ?? []);
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t("failedToLoadPriorities");
      toast.error(msg);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (categoryId: string, priority: number) => {
    try {
      setSavingPriority(categoryId);
      await api.post("/flashcards/priorities", { categoryId, priority });
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, priority } : c))
      );
      toast.success(t("priorityUpdated"));
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t("failedToUpdatePriority");
      toast.error(msg);
    } finally {
      setSavingPriority(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <BreadCrumbCom
        crumbs={[
          { name: tB("flashCards"), href: "/flashcards" },
          { name: tB("myPriorities"), href: "/flashcards/priorities" },
        ]}
        endtrail={tB("myPriorities")}
      />
      <div className="max-w-2xl mx-auto space-y-6 pb-8">
        <div>
          <h1 className="text-2xl font-bold">{t("myCategoryPriorities")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("setPreferredFocus")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              {t("categoryPriorities")}
            </CardTitle>
            <CardDescription>
              {t("priorityDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader variant="gif" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>{t("noCategoriesYet")}</p>
                <p className="text-sm mt-1">
                  <Link href="/flashcards/create-category" className="text-primary hover:underline">
                    {t("createCategoryLink")}
                  </Link>{" "}
                  {t("orBrowseToGetStarted")}
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
                        {t("cardCount", { count: c.cardCount ?? 0 })}
                      </span>
                    </div>
                    <Select
                      value={String(c.priority)}
                      onValueChange={(v) => {
                        const num = Number(v);
                        setCategories((prev) =>
                          prev.map((cat) =>
                            cat.id === c.id ? { ...cat, priority: num } : cat
                          )
                        );
                        handlePriorityChange(c.id, num);
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

        <div className="flex gap-3">
          <Link href="/flashcards">
            <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
              {t("backToFlashCardsLink")}
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
