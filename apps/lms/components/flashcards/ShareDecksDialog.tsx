"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@skill-learn/lib/utils/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@skill-learn/ui/components/dialog";
import { Button } from "@skill-learn/ui/components/button";
import { Checkbox } from "@skill-learn/ui/components/checkbox";
import { Label } from "@skill-learn/ui/components/label";
import { Loader } from "@skill-learn/ui/components/loader";
import { toast } from "sonner";
import { Share2 } from "lucide-react";

type Recipient = { id: string; [key: string]: unknown };
type DeckItem = { id: string; name?: string; cardIds?: unknown[]; hiddenCardIds?: unknown[] };

export default function ShareDecksDialog({
  open,
  onOpenChange,
  decks,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decks: DeckItem[];
  onSuccess?: () => void;
}) {
  const t = useTranslations("flashcards");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedDeckIds, setSelectedDeckIds] = useState<Set<string>>(new Set());
  const [recipientMode, setRecipientMode] = useState<"all" | "specific">("specific");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Pre-select when single deck (e.g. from deck detail page)
    const single = decks.length === 1 ? decks[0] : undefined;
    setSelectedDeckIds(single ? new Set([single.id]) : new Set());
    setSelectedUserIds(new Set());
    setRecipientMode("specific");
    setLoading(true);
    api
      .get("/flashcards/share/recipients")
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setRecipients(d?.recipients ?? []);
      })
      .catch(() => {
        toast.error(t("failedToLoadRecipients"));
        setRecipients([]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only init when opening
  }, [open]);

  const toggleDeck = (id: string) => {
    setSelectedDeckIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllDecks = () => {
    if (selectedDeckIds.size === decks.length) {
      setSelectedDeckIds(new Set());
    } else {
      setSelectedDeckIds(new Set(decks.map((d) => d.id)));
    }
  };

  const selectAllUsers = () => {
    if (selectedUserIds.size === recipients.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(recipients.map((r) => r.id)));
    }
  };

  const handleSubmit = async () => {
    const deckIds = Array.from(selectedDeckIds);
    if (deckIds.length === 0) {
      toast.error(t("selectAtLeastOneDeck"));
      return;
    }

    const recipientUserIds =
      recipientMode === "all" ? "all" : Array.from(selectedUserIds);
    if (recipientMode === "specific" && recipientUserIds.length === 0) {
      toast.error(t("selectAtLeastOneRecipient"));
      return;
    }

    setSharing(true);
    try {
      await api.post("/flashcards/decks/share", {
        deckIds,
        recipientUserIds,
      });
      const msg =
        recipientMode === "all"
          ? t("sharedDecksWithEveryone", { count: deckIds.length })
          : t("sharedDecksWithUsers", { count: deckIds.length, users: recipientUserIds.length });
      toast.success(msg);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t("failedToShareDecks");
      toast.error(msg);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            {t("shareDecks")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Decks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("decksToShare")}</Label>
              {decks.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllDecks}
                  className="h-8 text-xs"
                >
                  {selectedDeckIds.size === decks.length ? t("deselectAll") : t("selectAll")}
                </Button>
              )}
            </div>
            {decks.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noDecksToShare")}</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-2 rounded-lg border p-3">
                {decks.map((deck) => (
                  <div
                    key={deck.id}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      id={`deck-${deck.id}`}
                      checked={selectedDeckIds.has(deck.id)}
                      onCheckedChange={() => toggleDeck(deck.id)}
                    />
                    <Label
                      htmlFor={`deck-${deck.id}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {deck.name}
                      <span className="text-muted-foreground ml-1">
                        ({t("cardsLabel", { count: (deck.cardIds?.length ?? 0) - (deck.hiddenCardIds?.length ?? 0) })})
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recipients */}
          <div className="space-y-3">
            <Label>{t("shareWith")}</Label>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="recipient-specific"
                  checked={recipientMode === "specific"}
                  onCheckedChange={(v) =>
                    setRecipientMode(v ? "specific" : "all")
                  }
                />
                <Label htmlFor="recipient-specific" className="cursor-pointer text-sm">
                  {t("specificUsers")}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="recipient-all"
                  checked={recipientMode === "all"}
                  onCheckedChange={(v) =>
                    setRecipientMode(v ? "all" : "specific")
                  }
                />
                <Label htmlFor="recipient-all" className="cursor-pointer text-sm">
                  {t("allInWorkspace")}
                </Label>
              </div>
            </div>

            {recipientMode === "specific" && (
              <div className="space-y-2">
                {loading ? (
                  <Loader className="h-8" variant="spinner" />
                ) : recipients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("noOtherUsers")}
                  </p>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={selectAllUsers}
                      className="h-8 text-xs"
                    >
                      {selectedUserIds.size === recipients.length
                        ? t("deselectAll")
                        : t("selectAll")}
                    </Button>
                    <div className="max-h-40 overflow-y-auto space-y-2 rounded-lg border p-3">
                      {recipients.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`user-${r.id}`}
                            checked={selectedUserIds.has(r.id)}
                            onCheckedChange={() => toggleUser(r.id)}
                          />
                          <Label
                            htmlFor={`user-${r.id}`}
                            className="flex-1 cursor-pointer text-sm"
                          >
                            {r.displayName || r.username}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              sharing ||
              selectedDeckIds.size === 0 ||
              (recipientMode === "specific" &&
                (recipients.length === 0 || selectedUserIds.size === 0))
            }
          >
            {sharing ? (
              <Loader className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Share2 className="h-4 w-4 mr-2" />
            )}
            {t("share")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
