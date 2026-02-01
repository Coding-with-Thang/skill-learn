"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@skill-learn/lib/utils/axios.js";
import { useFlashCardDeckBuilderStore } from "@skill-learn/lib/stores/flashCardDeckBuilderStore.js";
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
import { Loader } from "@skill-learn/ui/components/loader";
import { Check, Plus } from "lucide-react";
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import { toast } from "sonner";

export default function DeckBuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cardsByCategory, setCardsByCategory] = useState({});

  const {
    selectedCardIds,
    deckName,
    deckDescription,
    setDeckName,
    setDeckDescription,
    toggleCard,
    isSelected,
    getSelectedIds,
    reset,
  } = useFlashCardDeckBuilderStore();

  useEffect(() => {
    Promise.all([
      api.get("/flashcards/categories"),
      api.get("/flashcards/cards"),
    ])
      .then(([catRes, cardRes]) => {
        const cats = catRes.data?.data?.categories ?? catRes.data?.categories ?? [];
        const cards = cardRes.data?.data?.cards ?? cardRes.data?.cards ?? [];
        setCategories(cats);

        const byCat = {};
        cards.forEach((c) => {
          const catId = c.categoryId ?? c.category?.id;
          if (!catId) return;
          if (!byCat[catId]) byCat[catId] = [];
          byCat[catId].push(c);
        });
        setCardsByCategory(byCat);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!deckName.trim()) {
      toast.error("Deck name is required");
      return;
    }

    setSaving(true);
    try {
      await api.post("/flashcards/decks", {
        name: deckName.trim(),
        description: deckDescription.trim() || undefined,
        cardIds: getSelectedIds(),
        categoryIds: [...new Set(
          getSelectedIds().flatMap((id) => {
            const cat = Object.entries(cardsByCategory).find(([, arr]) =>
              arr.some((c) => c.id === id)
            );
            return cat ? [cat[0]] : [];
          })
        )],
      });
      toast.success("Deck created");
      reset();
      router.push("/flashcards");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create deck");
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
          { name: "Deck Builder", href: "/flashcards/deck-builder" },
        ]}
      />
      <div className="max-w-4xl mx-auto space-y-8 pb-8">
        <div>
          <h1 className="text-3xl font-bold">Deck Builder</h1>
          <p className="text-muted-foreground mt-1">
            Select cards across categories. Duplicates are prevented.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Deck details</CardTitle>
            <CardDescription>Name and optional description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="My deck"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="desc">Description (optional)</Label>
              <Textarea
                id="desc"
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                placeholder="What this deck covers..."
                className="mt-1"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select cards</CardTitle>
            <CardDescription>
              {getSelectedIds().length} selected · Owned, Shared, Already added
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-muted-foreground py-4">No categories. Create cards first.</p>
            ) : (
              <div className="space-y-6">
                {categories.map((cat) => {
                  const cards = cardsByCategory[cat.id] ?? [];
                  if (cards.length === 0) return null;

                  return (
                    <div key={cat.id}>
                      <h3 className="font-medium mb-2">{cat.name}</h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {cards.map((c) => (
                          <div
                            key={c.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected(c.id)
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-muted/50"
                            }`}
                            onClick={() => toggleCard(c.id)}
                          >
                            <div
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                isSelected(c.id) ? "border-primary bg-primary" : "border-muted"
                              }`}
                            >
                              {isSelected(c.id) ? (
                                <Check className="h-3 w-3 text-primary-foreground" />
                              ) : (
                                <Plus className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{c.question}</p>
                              <p className="text-xs text-muted-foreground">
                                {c.source === "shared" ? "Shared" : "Owned"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving || getSelectedIds().length === 0}>
            {saving ? "Saving..." : "Create deck"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/flashcards")}>
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}
