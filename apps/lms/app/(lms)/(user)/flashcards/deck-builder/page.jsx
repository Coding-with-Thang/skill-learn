"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId");
  const isEdit = !!deckId;

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
    setSelectedCards,
    toggleCard,
    isSelected,
    getSelectedIds,
    reset,
  } = useFlashCardDeckBuilderStore();

  const [limits, setLimits] = useState({ maxDecks: -1, maxCardsPerDeck: -1, canCreateDeck: true });

  useEffect(() => {
    const load = async () => {
      try {
        const reqs = [
          api.get("/flashcards/categories"),
          api.get("/flashcards/cards"),
          api.get("/flashcards/limits"),
        ];
        if (deckId) reqs.push(api.get(`/flashcards/decks/${deckId}`));
        const results = await Promise.all(reqs);

        const cats = results[0].data?.data?.categories ?? results[0].data?.categories ?? [];
        const cards = results[1].data?.data?.cards ?? results[1].data?.cards ?? [];
        const lim = results[2].data?.data ?? results[2].data ?? {};
        const deckData = deckId && results[3]
          ? (results[3].data?.data?.deck ?? results[3].data?.deck)
          : null;

        setCategories(cats);
        setLimits({
          maxDecks: lim.limits?.maxDecks ?? -1,
          maxCardsPerDeck: lim.limits?.maxCardsPerDeck ?? -1,
          canCreateDeck: lim.canCreateDeck !== false,
        });

        const byCat = {};
        cards.forEach((c) => {
          const catId = c.categoryId ?? c.category?.id;
          if (!catId) return;
          if (!byCat[catId]) byCat[catId] = [];
          byCat[catId].push(c);
        });
        setCardsByCategory(byCat);

        if (deckData) {
          setDeckName(deckData.name);
          setDeckDescription(deckData.description ?? "");
          setSelectedCards(deckData.cardIds ?? []);
        }
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [deckId]);

  const maxCards = limits.maxCardsPerDeck < 0 ? Infinity : limits.maxCardsPerDeck;
  const atCardLimit = getSelectedIds().length >= maxCards;

  const handleSave = async () => {
    if (!deckName.trim()) {
      toast.error("Deck name is required");
      return;
    }
    if (!isEdit && !limits.canCreateDeck) {
      toast.error("Deck limit reached. Upgrade your plan for more decks.");
      return;
    }

    setSaving(true);
    try {
      const cardIds = getSelectedIds();
      const categoryIds = [...new Set(
        cardIds.flatMap((id) => {
          const cat = Object.entries(cardsByCategory).find(([, arr]) =>
            arr.some((c) => c.id === id)
          );
          return cat ? [cat[0]] : [];
        })
      )];

      if (isEdit) {
        await api.patch(`/flashcards/decks/${deckId}`, {
          name: deckName.trim(),
          description: deckDescription.trim() || undefined,
          cardIds,
          categoryIds,
        });
        toast.success("Deck updated");
      } else {
        await api.post("/flashcards/decks", {
          name: deckName.trim(),
          description: deckDescription.trim() || undefined,
          cardIds,
          categoryIds,
        });
        toast.success("Deck created");
      }
      reset();
      router.push("/flashcards");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save deck");
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
          { name: isEdit ? "Edit Deck" : "Deck Builder", href: "/flashcards/deck-builder" },
        ]}
      />
      <div className="max-w-4xl mx-auto space-y-8 pb-8">
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? "Edit Deck" : "Deck Builder"}</h1>
          <p className="text-muted-foreground mt-1">
            {isEdit
              ? "Add or remove cards. Cards can be in multiple decks."
              : "Select cards across categories. Categories are for organization — add any cards you want."}
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
              {getSelectedIds().length}{limits.maxCardsPerDeck >= 0 ? `/${limits.maxCardsPerDeck}` : ""} selected. Cards can be in multiple decks — add any that help you learn.
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
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                              atCardLimit && !isSelected(c.id)
                                ? "cursor-not-allowed opacity-60 border-border"
                                : "cursor-pointer"
                            } ${
                              isSelected(c.id)
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-muted/50"
                            }`}
                            onClick={() => {
                              if (atCardLimit && !isSelected(c.id)) {
                                toast.error(`Deck limit: ${limits.maxCardsPerDeck} cards max. Upgrade your plan for larger decks.`);
                                return;
                              }
                              toggleCard(c.id);
                            }}
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
          <Button
            onClick={handleSave}
            disabled={
              saving ||
              getSelectedIds().length === 0 ||
              (!isEdit && !limits.canCreateDeck)
            }
          >
            {saving
              ? "Saving..."
              : !isEdit && !limits.canCreateDeck
                ? "Deck limit reached"
                : isEdit
                  ? "Save changes"
                  : "Create deck"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/flashcards")}>
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}
