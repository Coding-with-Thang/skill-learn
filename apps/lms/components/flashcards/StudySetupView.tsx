"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@skill-learn/lib/utils/axios";
import { Card } from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Loader } from "@skill-learn/ui/components/loader";
import { Checkbox } from "@skill-learn/ui/components/checkbox";
import { Label } from "@skill-learn/ui/components/label";
import {
  Play,
  Infinity,
  Clock,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@skill-learn/lib/utils";
import BreadCrumbCom from "@/components/shared/BreadCrumb";

const getStudyModes = (t: (key: string) => string) => [
  { id: "once", label: t("playThroughOnce"), desc: t("goThroughAllCards"), icon: Play },
  { id: "infinite", label: t("infiniteUntilQuit"), desc: t("keepCyclingUntilExit"), icon: Infinity },
  { id: "time", label: t("timeBased"), desc: t("studyForSetDuration"), icon: Clock },
];

const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

type StudyHomeDeck = { id?: string; name?: string; cardIds?: unknown[]; hiddenCardIds?: unknown[] };
type RecommendedItem = { id?: string; name?: string; description?: string; cardCount?: number };
type StudyHomeData = { decks?: StudyHomeDeck[]; recommended?: RecommendedItem[] };

export default function StudySetupView({
  searchParams,
  onStart,
  error,
  onClearError,
}: {
  searchParams?: Record<string, unknown> & { get?: (k: string) => string | undefined };
  onStart?: (opts: unknown) => void;
  error?: string | null;
  onClearError?: () => void;
}) {
  const t = useTranslations("flashcards");
  const tB = useTranslations("breadcrumbs");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudyHomeData | null>(null);
  const [mode, setMode] = useState("once");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [selectedDeckIds, setSelectedDeckIds] = useState<Set<string>>(new Set());
  const [virtualSource, setVirtualSource] = useState<string | null>(null); // "due_today" | "needs_attention" | "company_focus" | null
  const [limit, setLimit] = useState(50);

  const params: Record<string, unknown> & { get?: (k: string) => string | undefined } = searchParams ?? {};
  const deckIdParam = (params.deckId as string | undefined) ?? params.get?.("deckId");
  const virtualParam = (params.virtualDeck as string | undefined) ?? params.get?.("virtualDeck");
  const categoryIdsParam = (params.categoryIds as string | undefined) ?? params.get?.("categoryIds");
  const limitParam = (params.limit as string | undefined) ?? params.get?.("limit");

  useEffect(() => {
    api
      .get("/flashcards/home")
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setData(d);
      })
      .catch(() => {
        setData({ decks: [], recommended: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data) return;
    if (deckIdParam) {
      setSelectedDeckIds(new Set([deckIdParam]));
      setVirtualSource(null);
    } else if (virtualParam) {
      setSelectedDeckIds(new Set());
      setVirtualSource(virtualParam.replace(/-/g, "_")); // due-today -> due_today
    }
  }, [data, deckIdParam, virtualParam]);

  useEffect(() => {
    if (limitParam) setLimit(Math.min(200, Math.max(1, parseInt(limitParam, 10) || 25)));
  }, [limitParam]);

  const toggleDeck = (id: string) => {
    setSelectedDeckIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setVirtualSource(null);
  };

  const selectVirtual = (id: string | null) => {
    setVirtualSource(id);
    setSelectedDeckIds(new Set());
  };

  const handleStart = () => {
    const deckIds = Array.from(selectedDeckIds);
    const hasDecks = deckIds.length > 0;
    const hasVirtual = virtualSource != null;

    if (!hasDecks && !hasVirtual) return;

    const sessionLimit = mode === "infinite" ? 200 : limit;
    const config = {
      mode,
      durationMinutes: mode === "time" ? durationMinutes : null,
      deckIds: hasDecks ? deckIds : undefined,
      deckId: hasDecks && deckIds.length === 1 ? deckIds[0] : undefined,
      virtualDeck: hasVirtual ? virtualSource : undefined,
      categoryIds: hasVirtual && virtualSource === "company_focus" && data?.recommended
        ? ((data.recommended as { id?: string; studyParams?: { categoryIds?: unknown[] } }[]).find((r) => r.id === "company-focus")?.studyParams?.categoryIds ?? [])
        : undefined,
      limit: sessionLimit,
    };
    onStart?.(config);
  };

  if (loading) return <Loader variant="gif" />;

  const decks = data?.decks ?? [];
  const recommended = data?.recommended ?? [];
  const hasDecks = selectedDeckIds.size > 0;
  const hasVirtual = virtualSource != null;
  const canStart = hasDecks || hasVirtual;

  const breadcrumbTrail =
    data?.decks?.[0] != null
      ? t("studySessionWithDeck", { name: data.decks[0].name ?? "...", count: data.decks[0].cardIds?.length ?? 0 })
      : t("studySession");

  const studyModes = getStudyModes(t);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-indigo-500/10 blur-[130px] rounded-full animate-pulse-subtle" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-cyan-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="max-w-2xl mx-auto w-full px-6 py-12 space-y-10">
        <BreadCrumbCom
          crumbs={[
            { name: tB("flashCards"), href: "/flashcards" },
          ]}
          endtrail={breadcrumbTrail}
        />
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-4xl bg-destructive/10 border border-destructive/20"
          >
            <AlertCircle className="w-5 h-5 text-brand-tealestructive shrink-0" />
            <p className="flex-1 text-sm font-medium text-brand-tealestructive">{error}</p>
            {onClearError && (
              <Button variant="ghost" size="sm" onClick={onClearError} className="text-brand-tealestructive hover:bg-destructive/10">
                {t("dismiss")}
              </Button>
            )}
          </motion.div>
        )}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("studySession")}</h1>
          <p className="text-muted-foreground">{t("chooseHowToStudy")}</p>
        </div>

        {/* Mode selector - media player style */}
        <Card className="p-6 rounded-3xl border-border bg-card/80 backdrop-blur">
          <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("studyMode")}</Label>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {studyModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-4xl border-2 transition-all text-left",
                  mode === m.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                <m.icon className={cn("w-6 h-6", mode === m.id ? "text-primary" : "text-muted-foreground")} />
                <span className="font-semibold text-sm">{m.label}</span>
                <span className="text-xs text-muted-foreground text-center">{m.desc}</span>
              </button>
            ))}
          </div>

          {mode === "time" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-border"
            >
              <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("duration")}</Label>
              <div className="flex flex-wrap gap-2 mt-3">
                {DURATION_OPTIONS.map((mins) => (
                  <Button
                    key={mins}
                    type="button"
                    variant={durationMinutes === mins ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDurationMinutes(mins)}
                    className="rounded-xl"
                  >
                    {mins} min
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </Card>

        {/* Deck / source selection */}
        <Card className="p-6 rounded-3xl border-border bg-card/80 backdrop-blur">
          <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Content</Label>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Select deck(s) or a smart session</p>

          {decks.length > 0 && (
            <div className="space-y-2 mb-6">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Your decks</span>
              <div className="max-h-40 overflow-y-auto space-y-2 rounded-lg border p-3">
                {decks.map((deck) => {
                  const visibleCount = (deck.cardIds?.length ?? 0) - (deck.hiddenCardIds?.length ?? 0);
                  return (
                    <div key={deck.id ?? undefined} className="flex items-center gap-3">
                      <Checkbox
                        id={`deck-${deck.id ?? ""}`}
                        checked={deck.id != null && selectedDeckIds.has(deck.id) && !hasVirtual}
                        onCheckedChange={() => deck.id != null && toggleDeck(deck.id)}
                      />
                      <Label
                        htmlFor={`deck-${deck.id}`}
                        className="flex-1 cursor-pointer text-sm font-medium"
                      >
                        {deck.name}
                        <span className="text-muted-foreground ml-1">({visibleCount} cards)</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Smart sessions</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recommended.map((r) => {
                const vId = r.id?.replace(/-/g, "_");
                const icons: Record<string, typeof Clock> = { due_today: Clock, needs_attention: AlertCircle, company_focus: Target };
                const Icon = (vId != null && icons[vId]) ? icons[vId] : Sparkles;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => selectVirtual(vId ?? null)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-4xl border-2 transition-all text-left",
                      virtualSource === vId
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl",
                      virtualSource === vId ? "bg-primary/20" : "bg-muted"
                    )}>
                      <Icon className={cn("w-5 h-5", virtualSource === vId ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm block">{r.name}</span>
                      <span className="text-xs text-muted-foreground line-clamp-2">{r.description}</span>
                      <span className="text-xs font-bold text-muted-foreground mt-1 block">
                        {r.cardCount ?? 0} cards
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="space-y-2">
          <Button
            size="lg"
            onClick={handleStart}
            disabled={!canStart}
            className="w-full h-16 rounded-4xl text-lg font-bold bg-linear-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-50"
          >
            Start Session
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          {!canStart && (
            <p className="text-center text-sm text-muted-foreground">Select at least one deck or a smart session</p>
          )}
        </div>
      </div>
    </div>
  );
}
