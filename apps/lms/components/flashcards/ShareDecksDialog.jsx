"use client";

import { useEffect, useState } from "react";
import api from "@skill-learn/lib/utils/axios.js";
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

export default function ShareDecksDialog({ open, onOpenChange, decks, onSuccess }) {
  const [recipients, setRecipients] = useState([]);
  const [selectedDeckIds, setSelectedDeckIds] = useState(new Set());
  const [recipientMode, setRecipientMode] = useState("specific"); // "all" | "specific"
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Pre-select when single deck (e.g. from deck detail page)
    setSelectedDeckIds(
      decks.length === 1 ? new Set([decks[0].id]) : new Set()
    );
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
        toast.error("Failed to load recipients");
        setRecipients([]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only init when opening
  }, [open]);

  const toggleDeck = (id) => {
    setSelectedDeckIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleUser = (id) => {
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
      toast.error("Select at least one deck");
      return;
    }

    const recipientUserIds =
      recipientMode === "all" ? "all" : Array.from(selectedUserIds);
    if (recipientMode === "specific" && recipientUserIds.length === 0) {
      toast.error("Select at least one recipient");
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
          ? `Shared ${deckIds.length} deck(s) with everyone`
          : `Shared ${deckIds.length} deck(s) with ${recipientUserIds.length} user(s)`;
      toast.success(msg);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to share decks");
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
            Share Decks
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Decks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Decks to share</Label>
              {decks.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllDecks}
                  className="h-8 text-xs"
                >
                  {selectedDeckIds.size === decks.length ? "Deselect all" : "Select all"}
                </Button>
              )}
            </div>
            {decks.length === 0 ? (
              <p className="text-sm text-muted-foreground">You have no decks to share.</p>
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
                        ({(deck.cardIds?.length ?? 0) - (deck.hiddenCardIds?.length ?? 0)} cards)
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recipients */}
          <div className="space-y-3">
            <Label>Share with</Label>
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
                  Specific users
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
                  All in workspace
                </Label>
              </div>
            </div>

            {recipientMode === "specific" && (
              <div className="space-y-2">
                {loading ? (
                  <Loader className="h-8" variant="spinner" />
                ) : recipients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No other users in your workspace.
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
                        ? "Deselect all"
                        : "Select all"}
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
            Cancel
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
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
