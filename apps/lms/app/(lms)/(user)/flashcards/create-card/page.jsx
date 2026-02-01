"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@skill-learn/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@skill-learn/ui/components/select";
import { Loader } from "@skill-learn/ui/components/loader";
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import { toast } from "sonner";

export default function CreateFlashCardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    api
      .get("/flashcards/categories")
      .then((res) => {
        const cats = res.data?.data?.categories ?? res.data?.categories ?? [];
        setCategories(cats);
        if (cats.length && !categoryId) setCategoryId(cats[0].id);
      })
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || !categoryId) {
      toast.error("Question, answer, and category are required");
      return;
    }

    setSaving(true);
    try {
      await api.post("/flashcards/cards", {
        question: question.trim(),
        answer: answer.trim(),
        categoryId,
        tags: tags
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      });
      toast.success("Card created");
      router.push("/flashcards");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create card");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader variant="gif" />;

  return (
    <>
      <BreadCrumbCom
        crumbs={[
          { name: "Flash Cards", href: "/flashcards" },
          { name: "Create Card", href: "/flashcards/create-card" },
        ]}
      />
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create Flash Card</h1>
          <p className="text-muted-foreground mt-1">
            Add a new card to your collection.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New card</CardTitle>
            <CardDescription>Question and answer</CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Create a category first to organize your cards.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/flashcards/create-category")}
                >
                  Create category
                </Button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category" className="mt-1">
                    <SelectValue placeholder="Select category" />
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
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What do you want to remember?"
                  className="mt-1"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="The answer or definition"
                  className="mt-1"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated, optional)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. vocabulary, chapter-1"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "Creating..." : "Create card"}
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
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
