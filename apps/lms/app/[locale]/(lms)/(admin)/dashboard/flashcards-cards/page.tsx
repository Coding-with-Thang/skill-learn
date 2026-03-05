"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@skill-learn/ui/components/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@skill-learn/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@skill-learn/ui/components/dialog";
import { Input } from "@skill-learn/ui/components/input";
import { Label } from "@skill-learn/ui/components/label";
import { Textarea } from "@skill-learn/ui/components/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@skill-learn/ui/components/dropdown-menu";
import { Loader } from "@skill-learn/ui/components/loader";
import { Layers, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import api from "@skill-learn/lib/utils/axios";
import { toast } from "sonner";

type CardItem = { id: string; question: string; answer: string; categoryId: string; category?: { id: string; name: string }; difficulty?: number | null };
type CategoryItem = { id: string; name: string };

export default function FlashCardsAdminCardsPage() {
  const t = useTranslations("adminFlashcardsCards");
  const [cards, setCards] = useState<CardItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editCard, setEditCard] = useState<CardItem | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [cardsRes, catsRes] = await Promise.all([
        api.get("/admin/flashcards/cards"),
        api.get("/admin/flashcards/priorities"),
      ]);
      const cardsData = cardsRes.data?.data ?? cardsRes.data;
      const catsData = catsRes.data?.data ?? catsRes.data;
      setCards((cardsData.cards ?? []) as CardItem[]);
      setCategories((catsData.categories ?? []) as CategoryItem[]);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("errorLoad"));
      setCards([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered =
    categoryFilter === "all"
      ? cards
      : cards.filter((c) => c.category?.id === categoryFilter);

  const handleDelete = async (card) => {
    if (!window.confirm(t("confirmDelete"))) return;
    try {
      await api.delete(`/admin/flashcards/cards/${card.id}`);
      toast.success(t("toastDeleted"));
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("errorDelete"));
    }
  };

  const handleSaveEdit = async () => {
    if (!editCard) return;
    setSaving(true);
    try {
      await api.put(`/admin/flashcards/cards/${editCard.id}`, {
        question: editCard.question,
        answer: editCard.answer,
        categoryId: editCard.categoryId,
        difficulty: editCard.difficulty || null,
      });
      toast.success(t("toastUpdated"));
      setEditCard(null);
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("errorUpdate"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader variant="gif" />;

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                {t("allCards")}
              </CardTitle>
              <CardDescription>{t("cardsCount", { count: filtered.length })}</CardDescription>
            </div>
            <Link href="/flashcards/create-card">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("createCard")}
              </Button>
            </Link>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("filterByCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              {t("noCards")}
            </p>
          ) : (
            <div className="rounded-4xld border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("question")}</TableHead>
                    <TableHead>{t("answer")}</TableHead>
                    <TableHead>{t("category")}</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell className="max-w-[200px] truncate">
                        {card.question}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {card.answer}
                      </TableCell>
                      <TableCell>{card.category?.name}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                setEditCard({
                                  ...card,
                                  question: card.question,
                                  answer: card.answer,
                                  categoryId: card.categoryId ?? card.category?.id ?? "",
                                  difficulty: card.difficulty ?? null,
                                })
                              }
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-brand-tealestructive"
                              onClick={() => handleDelete(card)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editCard} onOpenChange={(o) => !o && setEditCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editCard")}</DialogTitle>
          </DialogHeader>
          {editCard && (
            <div className="space-y-4 py-4">
              <div>
                <Label>{t("question")}</Label>
                <Textarea
                  value={editCard.question}
                  onChange={(e) =>
                    setEditCard((p) => (p ? { ...p, question: e.target.value } : null))
                  }
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t("answer")}</Label>
                <Textarea
                  value={editCard.answer}
                  onChange={(e) =>
                    setEditCard((p) => (p ? { ...p, answer: e.target.value } : null))
                  }
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t("category")}</Label>
                <Select
                  value={editCard.categoryId}
                  onValueChange={(v) =>
                    setEditCard((p) => (p ? { ...p, categoryId: v } : null))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("difficulty")}</Label>
                <Select
                  value={editCard.difficulty != null ? String(editCard.difficulty) : "none"}
                  onValueChange={(v) =>
                    setEditCard((p) => (p ? { ...p, difficulty: v === "none" ? null : Number(v) } : null))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("difficultyNone")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("difficultyNone")}</SelectItem>
                    <SelectItem value="easy">{t("difficultyEasy")}</SelectItem>
                    <SelectItem value="good">{t("difficultyGood")}</SelectItem>
                    <SelectItem value="hard">{t("difficultyHard")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCard(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
