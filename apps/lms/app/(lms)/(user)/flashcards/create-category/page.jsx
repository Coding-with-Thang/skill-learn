"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@skill-learn/lib/utils/axios.js";
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
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      await api.post("/flashcards/categories", { name: name.trim() });
      toast.success("Category created");
      router.push("/flashcards");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <BreadCrumbCom
        crumbs={[
          { name: "Flash Cards", href: "/flashcards" },
          { name: "Create Category", href: "/flashcards/create-category" },
        ]}
      />
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create Category</h1>
          <p className="text-muted-foreground mt-1">
            Organize your flash cards into categories.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New category</CardTitle>
            <CardDescription>Name for the category</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vocabulary, Sales Training"
                  className="mt-1"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "Creating..." : "Create category"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/flashcards")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
