"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@skill-learn/lib/utils/axios";
import {
  Card,
  CardContent,
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
import {
  Lightbulb,
  HelpCircle,
  Sparkles,
  Tag,
  BarChart,
  Send,
  LayoutGrid,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@skill-learn/lib/utils";

const emptyCard = () => ({ question: "", answer: "", tags: "", difficulty: "none" });

export default function CreateFlashCardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [batchLimit, setBatchLimit] = useState(30);
  const [subscriptionTier, setSubscriptionTier] = useState("");
  const [cards, setCards] = useState([emptyCard()]);

  const updateCard = useCallback((index, field, value) => {
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }, []);

  const addCard = useCallback(() => {
    setCards((prev) =>
      prev.length < batchLimit ? [...prev, emptyCard()] : prev
    );
  }, [batchLimit]);

  const removeCard = useCallback((index) => {
    setCards((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }, []);

  useEffect(() => {
    Promise.all([
      api.get("/flashcards/categories"),
      api.get("/flashcards/limits"),
    ])
      .then(([catRes, limitRes]) => {
        const cats = catRes.data?.data?.categories ?? catRes.data?.categories ?? [];
        setCategories(cats);
        if (cats.length && !categoryId) setCategoryId(cats[0].id);
        const data = limitRes.data?.data ?? limitRes.data ?? {};
        const tier = data.subscriptionTier ?? "";
        setSubscriptionTier(tier);
        // Normalize: LMS /flashcards/limits returns limits as object; CMS format returns limits as array
        const rawLimits = data.limits;
        const limitsObj = Array.isArray(rawLimits)
          ? rawLimits.find((l) => l.tier === tier) ?? rawLimits[0]
          : rawLimits;
        const maxCardsPerDeck = limitsObj?.maxCardsPerDeck;
        const batch =
          limitsObj?.maxCardsPerBatch ??
          (typeof maxCardsPerDeck === "number" && maxCardsPerDeck >= 0 ? maxCardsPerDeck : 500);
        if (batch != null && batch > 0) setBatchLimit(batch);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
    // Intentionally run once on mount to load categories/limits
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getValidCards = () => {
    return cards
      .map((c) => ({
        ...c,
        tags: c.tags
          ? c.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      }))
      .filter((c) => c.question.trim() && c.answer.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = getValidCards();
    if (!valid.length || !categoryId) {
      toast.error("Add at least one card with question and answer, and select a category");
      return;
    }
    if (valid.length > batchLimit) {
      toast.error(`Maximum ${batchLimit} cards per batch (subscription limit)`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        categoryId,
        cards: valid.map((c) => ({
          question: c.question.trim(),
          answer: c.answer.trim(),
          tags: c.tags,
          difficulty: c.difficulty !== "none" ? c.difficulty : null,
        })),
      };
      const res = await api.post("/flashcards/cards/bulk", payload);
      const created = res.data?.data?.created ?? res.data?.created ?? valid.length;
      toast.success(`Created ${created} card${created !== 1 ? "s" : ""} successfully!`);
      router.push("/flashcards");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create cards");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader variant="gif" />;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Top Navigation / Breadcrumbs */}
        <div className="py-6">
          <BreadCrumbCom
            crumbs={[
              { name: "Home", href: "/home" },
              { name: "Flash Cards", href: "/flashcards" },
            ]}
            endtrail="Create Flash Cards"
          />
        </div>

        {/* Hero Header Section */}
        <div className="flex flex-col items-center text-center space-y-4 pt-4 pb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full" />
            <div className="relative h-16 w-16 bg-linear-to-br from-yellow-300 to-orange-400 rounded-3xl flex items-center justify-center shadow-xl shadow-yellow-500/20 transform -rotate-6 animate-float">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-brand-teal font-black tracking-tight">
              Create Flash Cards
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
              Create one card or add up to {batchLimit} cards
              {subscriptionTier ? ` (${subscriptionTier} plan)` : ""}, then submit to create them all at once.
            </p>
          </div>
        </div>

        {/* Main Form Container */}
        <Card className="border-none bg-card/70 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Shared Settings Section */}
              <div className="rounded-4xl border border-dashed border-border/60 bg-white/5 p-6 space-y-4">
                <div className="space-y-2.5">
                  <Label htmlFor="category" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <LayoutGrid className="h-4 w-4 text-blue-500" />
                    Category (for all cards)
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="category" className="h-14 rounded-4xl bg-background border-border shadow-sm transition-all focus:ring-2 focus:ring-primary/20">
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
              </div>

              <div className="h-px bg-border/40" />

              {/* Card slots */}
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 px-1">
                  <div className="space-y-1">
                    <Label className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Batch Contents
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {getValidCards().length} ready to create • {cards.length}/{batchLimit} slots used
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCard}
                    disabled={cards.length >= batchLimit}
                    className="rounded-xl h-10 px-4 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all font-bold"
                    title={cards.length >= batchLimit ? `Limit reached (${batchLimit} per batch)` : "Add another card"}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Card {cards.length < batchLimit && `(${batchLimit - cards.length} left)`}
                  </Button>
                </div>

                <div className="grid gap-6">
                  {cards.map((card, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "relative rounded-4xl border bg-background/40 p-6 space-y-6 transition-all duration-300",
                        "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
                        "border-border shadow-sm"
                      )}
                    >
                      <div className="flex items-center justify-between border-b border-border/40 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            #{idx + 1}
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Flash Card Details
                          </span>
                        </div>
                        {cards.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCard(idx)}
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <Label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
                            <HelpCircle className="h-3.5 w-3.5 text-orange-500" />
                            Question
                          </Label>
                          <Textarea
                            value={card.question}
                            onChange={(e) => updateCard(idx, "question", e.target.value)}
                            placeholder="What do you want to remember?"
                            className="min-h-[120px] rounded-xl bg-background border-border p-4 text-base focus:ring-primary/20 resize-none"
                          />
                        </div>

                        <div className="space-y-2.5">
                          <Label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
                            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                            Answer
                          </Label>
                          <Textarea
                            value={card.answer}
                            onChange={(e) => updateCard(idx, "answer", e.target.value)}
                            placeholder="The answer or definition..."
                            className="min-h-[120px] rounded-xl bg-background border-border p-4 text-base focus:ring-primary/20 resize-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-border/40">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 px-1">
                            <Tag className="h-3.5 w-3.5 text-cyan-500" />
                            Tags <span className="text-[10px] font-normal opacity-70">(comma-separated)</span>
                          </Label>
                          <Input
                            value={card.tags}
                            onChange={(e) => updateCard(idx, "tags", e.target.value)}
                            placeholder="vocabulary, chapter-1"
                            className="h-12 rounded-xl bg-background/50 border-border focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 px-1">
                            <BarChart className="h-3.5 w-3.5 text-emerald-500" />
                            Difficulty <span className="text-[10px] font-normal opacity-70">(auto-study)</span>
                          </Label>
                          <Select
                            value={card.difficulty}
                            onValueChange={(v) => updateCard(idx, "difficulty", v)}
                          >
                            <SelectTrigger className="h-12 rounded-xl bg-background/50 border-border focus:ring-primary/20">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None (Recommended)</SelectItem>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 px-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-14 px-8 rounded-4xl font-bold text-slate-500 hover:text-slate-900 transition-all w-full sm:w-auto"
                  onClick={() => router.push("/flashcards")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !getValidCards().length || !categoryId}
                  className="h-14 px-10 rounded-4xl bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto min-w-[200px]"
                >
                  {saving ? (
                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="mr-2.5 h-4.5 w-4.5" />
                  )}
                  {saving
                    ? "Creating Batch..."
                    : `Create ${getValidCards().length} Flash Card${getValidCards().length !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
