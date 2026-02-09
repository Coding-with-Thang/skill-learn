"use client";

import { useState, useEffect, useCallback } from "react";
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
import api from "@skill-learn/lib/utils/axios.js";
import { toast } from "sonner";

export default function FlashCardsAdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCat, setEditCat] = useState(null);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/flashcards/priorities");
      const data = res.data?.data ?? res.data;
      setCategories(data.categories ?? []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load categories");
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
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/flashcards/categories", {
        name: newName.trim(),
        isSystem: true,
      });
      toast.success("Category created");
      setNewName("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Create failed");
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
      toast.success("Category updated");
      setEditCat(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    const msg =
      (cat.cardCount ?? 0) > 0
        ? `Delete "${cat.name}"? This will remove ${cat.cardCount} cards.`
        : `Delete "${cat.name}"?`;
    if (!window.confirm(msg)) return;
    try {
      await api.delete(`/admin/flashcards/categories/${cat.id}`);
      toast.success("Category deleted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  if (loading) return <Loader variant="gif" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <p className="text-muted-foreground mt-1">
          Create, edit, and delete flash card categories.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Categories
          </CardTitle>
          <CardDescription>{categories.length} categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Creating…" : "Create"}
            </Button>
          </div>

          {categories.length === 0 ? (
            <p className="text-muted-foreground py-8">No categories yet.</p>
          ) : (
            <div className="rounded-4xld border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Cards</TableHead>
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
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-brand-tealestructive"
                              onClick={() => handleDelete(cat)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editCat && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editCat.name}
                  onChange={(e) =>
                    setEditCat((p) => ({ ...p, name: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCat(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
