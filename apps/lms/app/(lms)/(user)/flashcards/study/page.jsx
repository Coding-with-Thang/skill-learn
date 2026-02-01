"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@skill-learn/lib/utils/axios.js";
import { useFlashCardStudyStore } from "@skill-learn/lib/stores/flashCardStudyStore.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Loader } from "@skill-learn/ui/components/loader";
import { ChevronLeft, ChevronRight, RotateCw, Frown, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import { toast } from "sonner";

export default function FlashCardStudyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId");
  const virtualDeck = searchParams.get("virtualDeck");
  const limit = parseInt(searchParams.get("limit") || "25", 10);

  const {
    cards,
    currentIndex,
    isFlipped,
    isSubmitting,
    totalDue,
    totalNew,
    setCards,
    nextCard,
    prevCard,
    flip,
    setSubmitting,
    getCurrentCard,
    hasNext,
    hasPrev,
    reset,
  } = useFlashCardStudyStore();

  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    try {
      const body = { limit };
      if (deckId) body.deckId = deckId;
      if (virtualDeck) body.virtualDeck = virtualDeck;
      const catIds = searchParams.get("categoryIds");
      if (catIds) body.categoryIds = catIds.split(",").filter(Boolean);
      const res = await api.post("/flashcards/study-session", body);
      const d = res.data?.data ?? res.data;
      setCards(d.cards ?? [], d.totalDue ?? 0, d.totalNew ?? 0);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load study session");
      router.push("/flashcards");
    } finally {
      setLoading(false);
    }
  }, [deckId, virtualDeck, searchParams, limit, setCards, router]);

  useEffect(() => {
    fetchSession();
    return () => reset();
  }, [fetchSession]);

  const handleFeedback = async (feedback) => {
    const card = getCurrentCard();
    if (!card || isSubmitting) return;

    setSubmitting(true);
    try {
      await api.post("/flashcards/progress", {
        flashCardId: card.id,
        feedback,
      });
      if (feedback === "got_it") {
        toast.success("We'll adjust when you see this again.");
      } else {
        toast.info("We'll show this again soon.");
      }
      if (hasNext()) nextCard();
      else {
        toast.success("Session complete!");
        router.push("/flashcards");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save progress");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader variant="gif" />;

  const card = getCurrentCard();
  if (!card && cards.length === 0) {
    return (
      <>
        <BreadCrumbCom
          crumbs={[
            { name: "Flash Cards", href: "/flashcards" },
            { name: "Study", href: "/flashcards/study" },
          ]}
        />
        <div className="max-w-lg mx-auto py-16 text-center">
          <p className="text-muted-foreground mb-4">No cards to study right now.</p>
          <Button onClick={() => router.push("/flashcards")}>Back to Flash Cards</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <BreadCrumbCom
        crumbs={[
          { name: "Flash Cards", href: "/flashcards" },
          { name: "Study", href: "/flashcards/study" },
        ]}
      />
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {cards.length}
            {totalDue > 0 && ` · ${totalDue} due`}
          </p>
          <Button variant="ghost" size="sm" onClick={() => router.push("/flashcards")}>
            Exit
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {card && (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="cursor-pointer min-h-[280px] flex flex-col"
                onClick={flip}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    {card.categoryName && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {card.categoryName}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        flip();
                      }}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center text-center px-6">
                  <p className="text-lg">
                    {isFlipped ? card.answer : card.question}
                  </p>
                </CardContent>
                {isFlipped && (
                  <CardFooter className="flex gap-3 justify-center pb-6 pt-2 border-t">
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback("needs_review");
                      }}
                      disabled={isSubmitting}
                    >
                      <Frown className="h-4 w-4 mr-2" />
                      Needs Review
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback("got_it");
                      }}
                      disabled={isSubmitting}
                    >
                      <Smile className="h-4 w-4 mr-2" />
                      Got It
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {card && isFlipped && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            We&apos;ll adjust when you see this again.
          </p>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevCard}
            disabled={!hasPrev()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={nextCard}
            disabled={!hasNext()}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </>
  );
}
