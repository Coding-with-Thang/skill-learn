"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@skill-learn/ui/components/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@skill-learn/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@skill-learn/ui/components/dropdown-menu";
import { Loader } from "@skill-learn/ui/components/loader";
import { FolderTree, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import api from "@skill-learn/lib/utils/axios";
import { toast } from "sonner";

type CategoryItem = { id: string; name: string; cardCount?: number };

export default function FlashCardsAdminCategoriesPage() {
  const t = useTranslations("adminFlashcardsCategories");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCat, setEditCat] = useState<CategoryItem | null>(null);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/flashcards/priorities");
      const data = res.data?.data ?? res.data;
      setCategories((data.categories ?? []) as CategoryItem[]);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("toastLoadFailed"));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error(t("toastNameRequired"));
      return;
    }
    setSaving(true);
    try {
      await api.post("/flashcards/categories", {
        name: newName.trim(),
        isSystem: true,
      });
      toast.success(t("toastCategoryCreated"));
      setNewName("");
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("toastCreateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editCat) return;
    setSaving(true);
    try {
      await api.put(`/admin/flashcards/categories/${editCat.id}`, {
        name: editCat.name,
      });
      toast.success(t("toastCategoryUpdated"));
      setEditCat(null);
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("toastUpdateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    const msg =
      (cat.cardCount ?? 0) > 0
        ? t("confirmDeleteWithCards", { name: cat.name, count: cat.cardCount ?? 0 })
        : t("confirmDelete", { name: cat.name });
    if (!window.confirm(msg)) return;
    try {
      await api.delete(`/admin/flashcards/categories/${cat.id}`);
      toast.success(t("toastCategoryDeleted"));
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("toastDeleteFailed"));
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
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            {t("categories")}
          </CardTitle>
          <CardDescription>{t("categoriesCount", { count: categories.length })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={t("newCategoryPlaceholder")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? t("creating") : t("create")}
            </Button>
          </div>

          {categories.length === 0 ? (
            <p className="text-muted-foreground py-8">{t("noCategories")}</p>
          ) : (
            <div className="rounded-4xld border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("cards")}</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell>{cat.cardCount ?? 0}</TableCell>
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
                                setEditCat({ ...cat, name: cat.name })
                              }
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-brand-tealestructive"
                              onClick={() => handleDelete(cat)}
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

      <Dialog open={!!editCat} onOpenChange={(o) => !o && setEditCat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editCategory")}</DialogTitle>
          </DialogHeader>
          {editCat && (
            <div className="space-y-4 py-4">
              <div>
                <Label>{t("name")}</Label>
                <Input
                  value={editCat.name}
                  onChange={(e) =>
                    setEditCat((p) => (p ? { ...p, name: e.target.value } : null))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCat(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
