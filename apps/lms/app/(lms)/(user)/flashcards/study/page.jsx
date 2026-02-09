"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import api from "@skill-learn/lib/utils/axios.js";
import { useFlashCardStudyStore } from "@skill-learn/lib/stores/flashCardStudyStore.js";
import StudySetupView from "@/components/flashcards/StudySetupView";
import StudyResultsView from "@/components/flashcards/StudyResultsView";
import { Card } from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Loader } from "@skill-learn/ui/components/loader";
import { Avatar, AvatarImage, AvatarFallback } from "@skill-learn/ui/components/avatar";
import {
  ChevronLeft,
  RotateCw,
  EyeOff,
  Zap,
  GraduationCap,
  Lightbulb,
  CheckCircle2,
  Clock,
  Shuffle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@skill-learn/lib/utils.js";

export default function FlashCardStudyPage() {
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams();

  const {
    cards,
    currentIndex,
    isFlipped,
    isSubmitting,
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
    loopToStart,
    shuffleCards,
  } = useFlashCardStudyStore();

  const [sessionConfig, setSessionConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [deckName, setDeckName] = useState("Flash Cards Session");
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(null);
  const timerRef = useRef(null);
  const [showResults, setShowResults] = useState(false);
  const [sessionStats, setSessionStats] = useState({ studied: 0, correct: 0 });
  const [uniqueCardIdsShown, setUniqueCardIdsShown] = useState(new Set());
  const [lastFeedback, setLastFeedback] = useState(null);
  const [startError, setStartError] = useState(null);
  const [hidingError, setHidingError] = useState(false);

  const handleStartSession = useCallback(async (config) => {
    setLoading(true);
    setStartError(null);
    setSessionConfig(config);
    try {
      const body = { limit: config.limit ?? 50 };
      if (config.deckIds?.length) {
        if (config.deckIds.length === 1) {
          body.deckId = config.deckIds[0];
        } else {
          body.deckIds = config.deckIds;
        }
      }
      if (config.virtualDeck) body.virtualDeck = config.virtualDeck;
      if (config.categoryIds?.length) body.categoryIds = config.categoryIds;

      const sessionRes = await api.post("/flashcards/study-session", body);
      const sessionData = sessionRes.data?.data ?? sessionRes.data;
      const sessionCards = sessionData.cards ?? [];
      setCards(sessionCards, sessionData.totalDue ?? 0, sessionData.totalNew ?? 0);

      if (sessionCards.length === 0) {
        setSessionConfig(null);
        setStartError("No cards to study in the selected content.");
        return;
      }

      setSessionStats({ studied: 0, correct: 0 });
      setUniqueCardIdsShown(new Set());
      setShowResults(false);

      if (config.deckIds?.length === 1) {
        const deckRes = await api.get(`/flashcards/decks/${config.deckIds[0]}`);
        setDeckName(deckRes.data?.data?.deck?.name || "Flash Cards Session");
      } else if (config.deckIds?.length > 1) {
        setDeckName(`${config.deckIds.length} Decks`);
      } else if (config.virtualDeck) {
        const labels = { due_today: "Due Today", needs_attention: "Needs Attention", company_focus: "Company Focus" };
        setDeckName(labels[config.virtualDeck] || "Smart Session");
      }

      const userRes = await api.get("/user");
      setStreak(userRes.data?.data?.user?.currentStreak || 0);

      if (config.mode === "time" && config.durationMinutes) {
        setTimeLeftSeconds(config.durationMinutes * 60);
      } else {
        setTimeLeftSeconds(null);
      }
    } catch (err) {
      setSessionConfig(null);
      setStartError(err.response?.data?.error || "Failed to load study session.");
    } finally {
      setLoading(false);
    }
  }, [setCards]);

  // Timer countdown for time-based mode
  useEffect(() => {
    if (sessionConfig?.mode !== "time" || timeLeftSeconds == null || timeLeftSeconds <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionConfig?.mode, timeLeftSeconds]);

  useEffect(() => {
    if (sessionConfig?.mode === "time" && timeLeftSeconds === 0) {
      setShowResults(true);
    }
  }, [sessionConfig?.mode, timeLeftSeconds]);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  // Track unique cards flipped to view answer
  useEffect(() => {
    if (isFlipped) {
      const card = getCurrentCard();
      if (card?.id) {
        setUniqueCardIdsShown((prev) => {
          if (prev.has(card.id)) return prev;
          return new Set(prev).add(card.id);
        });
      }
    }
  }, [isFlipped, getCurrentCard]);

  const handleFeedback = useCallback(async (feedback) => {
    const card = getCurrentCard();
    if (!card || isSubmitting) return;

    setSubmitting(true);
    const isCorrect = feedback === "got_it" || feedback === "mastered";
    setSessionStats((s) => ({
      studied: s.studied + 1,
      correct: s.correct + (isCorrect ? 1 : 0),
    }));

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
      } else if (sessionConfig?.mode === "infinite") {
        setShowHint(false);
        loopToStart();
      } else {
        setShowResults(true);
      }
    } catch (err) {
      setSessionStats((s) => ({
        studied: Math.max(0, s.studied - 1),
        correct: Math.max(0, s.correct - (isCorrect ? 1 : 0)),
      }));
      setLastFeedback("error");
      setTimeout(() => setLastFeedback(null), 2000);
    } finally {
      setSubmitting(false);
    }
  }, [getCurrentCard, isSubmitting, setSubmitting, hasNext, nextCard, loopToStart, sessionConfig?.mode]);

  // Keyboard Shortcuts (only active when sessionConfig is set)
  useEffect(() => {
    if (!sessionConfig) return;
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
  }, [sessionConfig, loading, isSubmitting, isFlipped, flip, handleFeedback]);

  if (!sessionConfig) {
    return (
      <StudySetupView
        searchParams={Object.fromEntries(searchParams?.entries() ?? [])}
        onStart={handleStartSession}
        error={startError}
        onClearError={() => setStartError(null)}
      />
    );
  }

  if (showResults) {
    return (
      <StudyResultsView
        stats={{ ...sessionStats, uniqueShown: uniqueCardIdsShown.size }}
        deckName={deckName}
        streak={streak}
        onReview={() => {
          setShowResults(false);
          setSessionStats({ studied: 0, correct: 0 });
          setUniqueCardIdsShown(new Set());
          reset();
          handleStartSession(sessionConfig);
        }}
      />
    );
  }

  if (loading) return <Loader variant="gif" />;

  const card = getCurrentCard();
  const progressPercent = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  if (!card && cards.length === 0) {
    return (
      <StudyResultsView
        stats={{ ...sessionStats, uniqueShown: uniqueCardIdsShown.size }}
        deckName={deckName}
        streak={streak}
        onReview={() => {
          setShowResults(false);
          setSessionStats({ studied: 0, correct: 0 });
          setUniqueCardIdsShown(new Set());
          reset();
          handleStartSession(sessionConfig);
        }}
      />
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
      <header className="px-6 py-4 flex items-center justify-between z-2000 sticky top-0 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="flex-1 flex justify-start">
          <Button
            variant="outline"
            onClick={() => setShowResults(true)}
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
          {cards.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                shuffleCards();
                toast.success("Deck shuffled");
              }}
              className="rounded-full h-9 px-4 gap-2"
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">Shuffle</span>
            </Button>
          )}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
            <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{streak} Day Streak</span>
          </div>
          <Avatar className="w-10 h-10 border-2 border-border shadow-sm">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-linear-to-br from-primary to-accent text-primary-foreground font-bold">
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
                    isFlipped ? "text-2xl md:text-3xl font-medium" : "text-3xl md:text-4xl lg:text-brand-teal"
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
                        "rounded-4xl border-border bg-card h-11 px-5 shadow-sm hover:bg-muted transition-all font-bold",
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
                  onClick={() => !isSubmitting && handleFeedback("needs_review")}
                  className={cn(
                    "group rounded-[24px] border-border bg-card hover:shadow-xl transition-all p-6 flex flex-col items-center text-center space-y-3 relative overflow-hidden",
                    isSubmitting ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-rose-500/[0.02]"
                  )}
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
                  onClick={() => !isSubmitting && handleFeedback("mastered")}
                  className={cn(
                    "group rounded-[24px] border-border bg-card hover:shadow-xl transition-all p-6 flex flex-col items-center text-center space-y-3 relative overflow-hidden",
                    isSubmitting ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-indigo-500/[0.02]"
                  )}
                >
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  <h3 className="text-lg font-bold text-indigo-500">Mastered</h3>
                  <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Skip for Now</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 6. Shortcuts Indicators */}
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

        {sessionConfig?.deckIds?.length === 1 && (
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              onClick={handleHideFromDeck}
              disabled={hiding}
              className="rounded-xl h-12 px-6 text-muted-foreground hover:text-brand-tealestructive font-bold"
            >
              <EyeOff className="w-4 h-4 mr-2" /> {hiding ? "Hiding..." : "Hide"}
            </Button>
            {hidingError && (
              <span className="text-xs text-brand-tealestructive">Could not hide card</span>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          onClick={() => {
            if (isFlipped) {
              if (hasNext()) nextCard();
              else if (sessionConfig?.mode === "infinite") loopToStart();
            } else {
              flip();
            }
          }}
          disabled={!hasNext() && isFlipped && sessionConfig?.mode !== "infinite"}
          className="rounded-xl h-12 px-6 font-bold"
        >
          {isFlipped ? "Next" : "Reveal"} <RotateCw className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  async function handleHideFromDeck() {
    const deckId = sessionConfig?.deckIds?.[0];
    if (!card || !deckId || hiding) return;
    setHiding(true);
    try {
      await api.post(`/flashcards/decks/${deckId}/hide-card`, {
        cardId: card.id,
        hidden: true,
      });
      setHidingError(false);
      removeCurrentCard();
      if (cards.length <= 1) setShowResults(true);
    } catch (err) {
      setHidingError(true);
      setTimeout(() => setHidingError(false), 3000);
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
