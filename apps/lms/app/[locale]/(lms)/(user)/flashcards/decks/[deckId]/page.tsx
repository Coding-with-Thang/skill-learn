"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import api from "@skill-learn/lib/utils/axios";
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
import ShareDecksDialog from "@/components/flashcards/ShareDecksDialog";
import { toast } from "sonner";

type DeckShape = { id: string; name?: string; isPublic?: boolean; cardIds?: string[]; hiddenCardIds?: string[]; cards?: { id: string; question?: string }[] };

export default function DeckSettingsPage() {
  const t = useTranslations("flashcards");
  const tB = useTranslations("breadcrumbs");
  const params = useParams();
  const router = useRouter();
  const deckId = params?.deckId;

  const [deck, setDeck] = useState<DeckShape | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    if (!deckId) return;
    api
      .get(`/flashcards/decks/${deckId}`)
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setDeck((d?.deck ?? null) as DeckShape | null);
      })
      .catch(() => {
        toast.error(t("deckNotFound"));
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
      toast.success(deck?.isPublic ? t("deckNowPrivate") : t("deckNowShared"));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("failedToUpdate"));
    } finally {
      setSharing(false);
    }
  };

  const removeFromDeck = async (cardId: string) => {
    if (!deck) return;
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
      toast.success(t("cardRemovedFromDeck"));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("failedToRemove"));
    } finally {
      setToggling(null);
    }
  };

  const toggleHidden = async (cardId: string, currentlyHidden: boolean) => {
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
      toast.success(currentlyHidden ? t("cardUnhidden") : t("cardHidden"));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("failedToUpdate"));
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
          { name: tB("flashCards"), href: "/flashcards" },
          { name: deck.name ?? "", href: `/flashcards/decks/${deckId}` },
        ]}
        endtrail={deck.name ?? ""}
      />
      <div className="max-w-2xl mx-auto space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t("deckLabel")}: {deck.name}</h1>
            <p className="text-muted-foreground mt-1">
              {t("hideCardsDescription")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareDialogOpen(true)}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {t("shareToUsers")}
            </Button>
            <Button
              variant={deck.isPublic ? "default" : "outline"}
              size="sm"
              onClick={toggleShare}
              disabled={sharing}
            >
              {deck.isPublic ? t("sharedWithWorkspace") : t("shareWithWorkspace")}
            </Button>
          </div>
        </div>

        <ShareDecksDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          decks={[deck]}
          onSuccess={() => {
            api.get(`/flashcards/decks/${deckId}`).then((res) => {
              const d = res.data?.data ?? res.data;
              setDeck(d?.deck ?? deck);
            });
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>{t("visibleCards")} ({visibleCards.length})</CardTitle>
            <CardDescription>{t("visibleCardsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {visibleCards.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">{t("noVisibleCards")}</p>
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
                      {t("hide")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-brand-tealestructive hover:text-brand-tealestructive"
                      onClick={() => removeFromDeck(c.id)}
                      disabled={toggling === c.id}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t("remove")}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("hiddenCards")} ({hiddenCards.length})</CardTitle>
            <CardDescription>{t("unhideToInclude")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {hiddenCards.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">{t("noHiddenCards")}</p>
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
                      {t("unhide")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-brand-tealestructive hover:text-brand-tealestructive"
                      onClick={() => removeFromDeck(c.id)}
                      disabled={toggling === c.id}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t("remove")}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push(`/flashcards/study?deckId=${deckId}&limit=25`)}>
            {t("studyThisDeck")}
          </Button>
          <Link href={`/flashcards/deck-builder?deckId=${deckId}`}>
            <Button variant="outline">{t("addOrRemoveCards")}</Button>
          </Link>
          <Link href="/flashcards">
            <Button variant="outline">{t("backToFlashCards")}</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
