"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import api from "@skill-learn/lib/utils/axios.js";
import { useFlashCardStudyStore } from "@skill-learn/lib/stores/flashCardStudyStore.js";
import { Card } from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Loader } from "@skill-learn/ui/components/loader";
import { Progress } from "@skill-learn/ui/components/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@skill-learn/ui/components/avatar";
import {
  ChevronLeft,
  RotateCw,
  Frown,
  Smile,
  EyeOff,
  Zap,
  GraduationCap,
  Lightbulb,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@skill-learn/lib/utils.js";

export default function FlashCardStudyPage() {
  const router = useRouter();
  const { user } = useUser();
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
    setCards,
    nextCard,
    prevCard,
    flip,
    setSubmitting,
    getCurrentCard,
    hasNext,
    hasPrev,
    removeCurrentCard,
    reset,
  } = useFlashCardStudyStore();

  const [loading, setLoading] = useState(true);
  const [hiding, setHiding] = useState(false);
  const [deckName, setDeckName] = useState("Flash Cards Session");
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const fetchSessionData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Session Cards
      const body = { limit };
      if (deckId) body.deckId = deckId;
      if (virtualDeck) body.virtualDeck = virtualDeck;
      const catIds = searchParams.get("categoryIds");
      if (catIds) body.categoryIds = catIds.split(",").filter(Boolean);

      const sessionRes = await api.post("/flashcards/study-session", body);
      const sessionData = sessionRes.data?.data ?? sessionRes.data;
      setCards(sessionData.cards ?? [], sessionData.totalDue ?? 0, sessionData.totalNew ?? 0);

      // 2. Fetch Deck Name if applicable
      if (deckId) {
        const deckRes = await api.get(`/flashcards/decks/${deckId}`);
        setDeckName(deckRes.data?.data?.deck?.name || "Flash Cards Session");
      } else if (virtualDeck) {
        const labels = {
          due_today: "Due Today",
          needs_attention: "Needs Attention",
          company_focus: "Company Focus"
        };
        setDeckName(labels[virtualDeck] || "Smart Session");
      }

      // 3. Fetch User Streak
      const userRes = await api.get("/user");
      setStreak(userRes.data?.data?.user?.currentStreak || 0);

    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load study session");
      router.push("/flashcards");
    } finally {
      setLoading(false);
    }
  }, [deckId, virtualDeck, searchParams, limit, setCards, router]);

  useEffect(() => {
    fetchSessionData();
    return () => reset();
  }, [fetchSessionData, reset]);

  const handleFeedback = useCallback(async (feedback) => {
    const card = getCurrentCard();
    if (!card || isSubmitting) return;

    setSubmitting(true);
    try {
      await api.post("/flashcards/progress", {
        flashCardId: card.id,
        feedback,
      });

      const messages = {
        needs_review: "We'll show this again soon.",
        got_it: "Nicely done! Progress recorded.",
        mastered: "Mastered! We'll extend the interval significantly."
      };

      toast.success(messages[feedback] || "Progress saved.");

      if (hasNext()) {
        setShowHint(false);
        nextCard();
      } else {
        toast.success("Session complete!");
        router.push("/flashcards");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save progress");
    } finally {
      setSubmitting(false);
    }
  }, [getCurrentCard, isSubmitting, setSubmitting, hasNext, nextCard, router]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading || isSubmitting) return;
      if (e.code === "Space") {
        e.preventDefault();
        flip();
      } else if (isFlipped) {
        if (e.key === "1") handleFeedback("needs_review");
        if (e.key === "2") handleFeedback("got_it");
        if (e.key === "3") handleFeedback("mastered");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, isSubmitting, isFlipped, flip, handleFeedback]);

  if (loading) return <Loader variant="gif" />;

  const card = getCurrentCard();
  const progressPercent = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  if (!card && cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Session Complete!</h2>
          <p className="text-muted-foreground">You&apos;ve gone through all the selected cards. Great job on your learning progress!</p>
          <Button onClick={() => router.push("/flashcards")} className="mt-8 rounded-2xl h-14 px-8 font-bold">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col font-sans transition-colors duration-500">
      {/* Background Orbs - Adjusted for better theme-aware vibrancy */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-indigo-500/10 dark:bg-indigo-500/10 blur-[130px] rounded-full animate-pulse-subtle" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-cyan-500/10 dark:bg-cyan-500/10 blur-[130px] rounded-full animate-float" />
      </div>

      {/* 1. Header */}
      <header className="px-6 py-4 flex items-center justify-between z-20 sticky top-0 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="flex-1 flex justify-start">
          <Button
            variant="outline"
            onClick={() => router.push("/flashcards")}
            className="rounded-full h-11 px-5 border-border bg-card shadow-sm hover:shadow-md transition-all font-semibold"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> Exit Study
          </Button>
        </div>

        <div className="flex-1 flex justify-center">
          <h1 className="text-lg font-bold tracking-tight text-center truncate px-4">
            {deckName}
          </h1>
        </div>

        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
            <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{streak} Day Streak</span>
          </div>
          <Avatar className="w-10 h-10 border-2 border-border shadow-sm">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
              {user?.firstName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-4 space-y-8 z-10">
        {/* 2. Progress Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Session Progress</span>
              <div className="h-1.5 w-64 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-muted-foreground">{Math.round(progressPercent)}% Complete</span>
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">
              Card <span className="text-foreground">{currentIndex + 1}</span> of {cards.length}
            </span>
          </div>
        </div>

        {/* 3. Flash Card Section */}
        <div className="flex-1 flex items-center justify-center py-4 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={card.id + (isFlipped ? "-back" : "-front")}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0, scale: 0.9 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-3xl perspective-1000"
            >
              <Card
                onClick={flip}
                className="min-h-[460px] relative rounded-[40px] border-border shadow-2xl bg-card cursor-pointer overflow-hidden group select-none flex flex-col items-center justify-center p-12 text-center transition-all duration-300 hover:shadow-indigo-500/5 hover:border-indigo-500/20"
              >
                {/* Decoration Icons */}
                <div className="absolute top-8 right-8 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
                  <GraduationCap className="w-12 h-12" />
                </div>

                <div className="absolute bottom-12 left-12">
                  <span className="text-6xl italic font-black text-foreground/[0.03] transition-colors">#{currentIndex + 1}</span>
                </div>

                {/* Category/Tag */}
                <div className="mb-10 px-6 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/10">
                  <span className="text-[10px] font-black tracking-[0.2em] text-indigo-600 dark:text-indigo-400 uppercase">
                    {card.categoryName || "Knowledge Area"}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto space-y-8">
                  <h2 className={cn(
                    "font-bold leading-tight tracking-tight text-foreground",
                    isFlipped ? "text-2xl md:text-3xl font-medium" : "text-3xl md:text-4xl lg:text-5xl"
                  )}>
                    {isFlipped ? card.answer : card.question}
                  </h2>

                  {!isFlipped && (
                    <motion.p
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-muted-foreground font-semibold"
                    >
                      Tap or press space to reveal answer
                    </motion.p>
                  )}

                  {isFlipped && showHint && card.tags?.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {card.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-muted rounded-lg text-xs font-bold text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hint Button */}
                {!isFlipped && (
                  <div className="absolute bottom-8 right-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(!showHint);
                      }}
                      className={cn(
                        "rounded-2xl border-border bg-card h-11 px-5 shadow-sm hover:bg-muted transition-all font-bold",
                        showHint && "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      <Lightbulb className={cn("w-4 h-4 mr-2", showHint && "fill-current")} />
                      Hint
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. Feedback Buttons Section */}
        <div className="z-10">
          <AnimatePresence>
            {isFlipped && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Need Review */}
                <Card
                  onClick={() => handleFeedback("needs_review")}
                  className="group cursor-pointer rounded-[24px] border-border bg-card hover:bg-rose-500/[0.02] hover:shadow-xl transition-all p-6 flex flex-col items-center text-center space-y-3 relative overflow-hidden"
                >
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-rose-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  <h3 className="text-lg font-bold text-rose-500">Need Review</h3>
                  <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase uppercase">Show Again Soon</p>
                </Card>

                {/* Got It */}
                <Card
                  onClick={() => handleFeedback("got_it")}
                  className="group cursor-pointer rounded-[24px] border-border bg-card hover:bg-emerald-500/[0.02] hover:shadow-xl transition-all p-6 flex flex-col items-center text-center space-y-3 relative overflow-hidden"
                >
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  <h3 className="text-lg font-bold text-emerald-500">Got It</h3>
                  <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Standard Spacing</p>
                </Card>

                {/* Mastered */}
                <Card
                  onClick={() => handleFeedback("mastered")}
                  className="group cursor-pointer rounded-[24px] border-border bg-card hover:bg-indigo-500/[0.02] hover:shadow-xl transition-all p-6 flex flex-col items-center text-center space-y-3 relative overflow-hidden"
                >
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  <h3 className="text-lg font-bold text-indigo-500">Mastered</h3>
                  <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Skip for Now</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. Shortcuts Indicators */}
        <div className="flex flex-wrap justify-center gap-3 py-4">
          <ShortcutPill keyName="1" label="HARD" />
          <ShortcutPill keyName="2" label="GOOD" />
          <ShortcutPill keyName="3" label="EASY" />
          <ShortcutPill keyName="SPACE" label="FLIP" className="ml-4" />
        </div>
      </main>

      {/* Navigation Controls (Mobile/Fallback) */}
      <div className="px-6 py-4 flex justify-between items-center bg-background/60 backdrop-blur-xl border-t border-border mt-auto">
        <Button
          variant="ghost"
          onClick={prevCard}
          disabled={!hasPrev()}
          className="rounded-xl h-12 px-6 font-bold"
        >
          <ChevronLeft className="w-5 h-5 mr-2" /> Previous
        </Button>

        {deckId && (
          <Button
            variant="ghost"
            onClick={handleHideFromDeck}
            disabled={hiding}
            className="rounded-xl h-12 px-6 text-muted-foreground hover:text-destructive font-bold"
          >
            <EyeOff className="w-4 h-4 mr-2" /> {hiding ? "Hiding..." : "Hide"}
          </Button>
        )}

        <Button
          variant="ghost"
          onClick={() => {
            if (isFlipped) nextCard();
            else flip();
          }}
          disabled={!hasNext() && isFlipped}
          className="rounded-xl h-12 px-6 font-bold"
        >
          {isFlipped ? "Next" : "Reveal"} <RotateCw className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  async function handleHideFromDeck() {
    if (!card || !deckId || hiding) return;
    setHiding(true);
    try {
      await api.post(`/flashcards/decks/${deckId}/hide-card`, {
        cardId: card.id,
        hidden: true,
      });
      toast.success("Card hidden from this deck");
      removeCurrentCard();
      if (cards.length <= 1) router.push("/flashcards");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to hide card");
    } finally {
      setHiding(false);
    }
  }
}

function ShortcutPill({ keyName, label, className }) {
  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border shadow-sm", className)}>
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{keyName}</span>
      <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">{label}</span>
    </div>
  );
}
