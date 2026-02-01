"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@skill-learn/lib/utils/axios.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Loader } from "@skill-learn/ui/components/loader";
import { Eye, EyeOff, Share2, Trash2 } from "lucide-react";
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import { toast } from "sonner";

export default function DeckSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params?.deckId;

  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!deckId) return;
    api
      .get(`/flashcards/decks/${deckId}`)
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setDeck(d?.deck ?? null);
      })
      .catch(() => {
        toast.error("Deck not found");
        router.push("/flashcards");
      })
      .finally(() => setLoading(false));
  }, [deckId, router]);

  const toggleShare = async () => {
    setSharing(true);
    try {
      const res = await api.patch(`/flashcards/decks/${deckId}`, {
        isPublic: !deck?.isPublic,
      });
      const d = res.data?.data ?? res.data;
      setDeck((prev) => (prev ? { ...prev, isPublic: d?.deck?.isPublic ?? !prev.isPublic } : prev));
      toast.success(deck?.isPublic ? "Deck is now private" : "Deck is now shared with your workspace");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update");
    } finally {
      setSharing(false);
    }
  };

  const removeFromDeck = async (cardId) => {
    setToggling(cardId);
    try {
      const newCardIds = (deck.cardIds ?? []).filter((id) => id !== cardId);
      const newHidden = (deck.hiddenCardIds ?? []).filter((id) => id !== cardId);
      await api.patch(`/flashcards/decks/${deckId}`, {
        cardIds: newCardIds,
        hiddenCardIds: newHidden,
      });
      setDeck((prev) =>
        prev
          ? {
              ...prev,
              cardIds: newCardIds,
              hiddenCardIds: newHidden,
              cards: (prev.cards ?? []).filter((c) => c.id !== cardId),
            }
          : prev
      );
      toast.success("Card removed from deck");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove");
    } finally {
      setToggling(null);
    }
  };

  const toggleHidden = async (cardId, currentlyHidden) => {
    setToggling(cardId);
    try {
      await api.post(`/flashcards/decks/${deckId}/hide-card`, {
        cardId,
        hidden: !currentlyHidden,
      });
      setDeck((prev) => {
        if (!prev) return prev;
        const hidden = new Set(prev.hiddenCardIds ?? []);
        if (currentlyHidden) hidden.delete(cardId);
        else hidden.add(cardId);
        return { ...prev, hiddenCardIds: Array.from(hidden) };
      });
      toast.success(currentlyHidden ? "Card unhidden" : "Card hidden");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update");
    } finally {
      setToggling(null);
    }
  };

  if (loading || !deck) return <Loader variant="gif" />;

  const hiddenSet = new Set(deck.hiddenCardIds ?? []);
  const visibleCards = (deck.cards ?? []).filter((c) => !hiddenSet.has(c.id));
  const hiddenCards = (deck.cards ?? []).filter((c) => hiddenSet.has(c.id));

  return (
    <>
      <BreadCrumbCom
        crumbs={[
          { name: "Flash Cards", href: "/flashcards" },
          { name: deck.name, href: `/flashcards/decks/${deckId}` },
        ]}
      />
      <div className="max-w-2xl mx-auto space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Deck: {deck.name}</h1>
            <p className="text-muted-foreground mt-1">
              Hide cards you don&apos;t want to study. Hidden cards won&apos;t appear in study sessions.
            </p>
          </div>
          <Button
            variant={deck.isPublic ? "default" : "outline"}
            size="sm"
            onClick={toggleShare}
            disabled={sharing}
          >
            <Share2 className="h-4 w-4 mr-2" />
            {deck.isPublic ? "Shared" : "Share with workspace"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Visible cards ({visibleCards.length})</CardTitle>
            <CardDescription>These cards will appear when you study this deck</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {visibleCards.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No visible cards.</p>
            ) : (
              visibleCards.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border"
                  >
                    <p className="text-sm truncate flex-1">{c.question}</p>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHidden(c.id, false)}
                        disabled={toggling === c.id}
                      >
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeFromDeck(c.id)}
                        disabled={toggling === c.id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hidden cards ({hiddenCards.length})</CardTitle>
            <CardDescription>Unhide to include them in study sessions again</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {hiddenCards.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No hidden cards.</p>
            ) : (
              hiddenCards.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border opacity-75"
                  >
                    <p className="text-sm truncate flex-1">{c.question}</p>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHidden(c.id, true)}
                        disabled={toggling === c.id}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Unhide
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeFromDeck(c.id)}
                        disabled={toggling === c.id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push(`/flashcards/study?deckId=${deckId}&limit=25`)}>
            Study this deck
          </Button>
          <Link href={`/flashcards/deck-builder?deckId=${deckId}`}>
            <Button variant="outline">Add or remove cards</Button>
          </Link>
          <Link href="/flashcards">
            <Button variant="outline">Back to Flash Cards</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
