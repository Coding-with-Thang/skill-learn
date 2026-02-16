"use client";

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
import {
  BookOpen,
  Plus,
  ChevronRight,
  Clock,
  AlertCircle,
  Target,
  Sliders,
  BarChart3,
  Download,
  Shield,
  Zap,
  LayoutGrid,
  List,
  Play,
  ArrowRight,
  Users,
  Lightbulb,
  Terminal,
  Compass,
  ShieldCheck,
  Rocket,
  Banknote,
  Sparkles,
  Share2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedProgressRing } from "@skill-learn/ui/components/animated-progress";
import { Badge } from "@skill-learn/ui/components/badge";
import { cn } from "@skill-learn/lib/utils";
import ShareDecksDialog from "@/components/flashcards/ShareDecksDialog";

type Deck = { id: string; name?: string; categoryName?: string; cardIds?: unknown[]; hiddenCardIds?: unknown[] };
type SharedDeck = { id: string; name?: string; cardCount?: number; ownerUsername?: string };
type Category = { id: string; name?: string };
type FlashcardsHomeData = { decks?: Deck[]; sharedDecks?: SharedDeck[]; categories?: Category[]; recommended?: unknown[]; stats?: { dueToday?: number; needsAttention?: number }; limits?: { maxDecks?: number; currentDeckCount?: number; canCreateDeck?: boolean } };

export default function FlashCardsHomePage() {
  const t = useTranslations("flashcards");
  const router = useRouter();
  const [data, setData] = useState<FlashcardsHomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptingDeckId, setAcceptingDeckId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    api
      .get("/flashcards/home")
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setData(d as FlashcardsHomeData);
      })
      .catch(() => setData({ decks: [], categories: [], recommended: [], stats: {} }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader variant="gif" />;

  const {
    decks = [],
    sharedDecks = [],
    categories = [],
    recommended = [],
    stats = {} as FlashcardsHomeData["stats"],
    limits = {} as FlashcardsHomeData["limits"]
  } = data ?? {};

  const { maxDecks, currentDeckCount = 0, canCreateDeck = true } = limits ?? {};

  const handleAcceptDeck = async (deckId: string, e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    setAcceptingDeckId(deckId);
    try {
      await api.post("/flashcards/decks/accept", { deckId });
      toast.success(t("deckAdded"));
      const res = await api.get("/flashcards/home");
      setData((res.data?.data ?? res.data) as FlashcardsHomeData);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || t("failedToAccept"));
    } finally {
      setAcceptingDeckId(null);
    }
  };

  const startStudy = (params: { deckId?: string; virtualDeck?: string; categoryIds?: string[] | string; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.deckId) q.set("deckId", params.deckId);
    if (params.virtualDeck) q.set("virtualDeck", params.virtualDeck);
    if (params.categoryIds) {
      q.set("categoryIds", Array.isArray(params.categoryIds)
        ? params.categoryIds.join(",")
        : String(params.categoryIds));
    }
    if (params.limit) q.set("limit", String(params.limit));
    const search = q.toString();
    router.push(`/flashcards/study${search ? `?${search}` : ""}`);
  };

  // Helper to get category icon and color
  const getCategoryTheme = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('security')) return { icon: Shield, color: '#0a6673', label: 'SECURITY', sub: 'Privacy 101' };
    if (name.includes('sale')) return { icon: Banknote, color: '#8c3a63', label: 'SALES', sub: 'Sales Mastery' };
    if (name.includes('product')) return { icon: Lightbulb, color: '#1a735a', label: 'PRODUCT', sub: 'v2.0 Updates' };
    if (name.includes('onboarding')) return { icon: Rocket, color: '#1a735a', label: 'ONBOARDING', sub: 'New Joiner' };
    if (name.includes('engineer')) return { icon: Terminal, color: '#3b4896', label: 'ENGINEERING', sub: 'Tech Stack' };
    if (name.includes('design')) return { icon: Compass, color: '#1a735a', label: 'DESIGN', sub: 'UI/UX' };
    if (name.includes('ethics')) return { icon: ShieldCheck, color: '#8c2a38', label: 'ETHICS', sub: 'Compliance' };
    if (name.includes('hr')) return { icon: Users, color: '#8c3a63', label: 'SALES & HR', sub: 'Team Culture' };
    return { icon: BookOpen, color: '#64748b', label: 'GENERAL', sub: 'Misc' };
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 space-y-12">
      <style dangerouslySetInnerHTML={{
        __html: `
        .force-bg {
          background-color: var(--custom-bg) !important;
        }
      ` }} />

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] bg-slate-950 p-8 md:p-12 lg:p-16 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-bl from-blue-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-linear-to-tr from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">{t("flashcardsHub")}</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-brand-teal lg:text-6xl font-bold text-white leading-tight">
                {t("masteryThroughRepetition")} <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400">{t("repetition")}</span>
              </h1>
              <p className="max-w-xl text-lg text-white/60 leading-relaxed mx-auto lg:mx-0">
                {t("unlockPowerMemory")}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
              <Link href="/flashcards/create-card">
                <Button size="lg" className="h-14 rounded-4xl bg-linear-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 border-none px-10 font-bold text-white shadow-lg shadow-cyan-500/20 text-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  {t("createCards")}
                </Button>
              </Link>
              <Link href="/flashcards/decks">
                <Button size="lg" variant="outline" className="h-14 rounded-4xl bg-white/5 border-white/10 text-white hover:bg-white/10 px-10 font-bold backdrop-blur-md text-lg">
                  {t("viewAllCards")}
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex-1 relative hidden lg:flex justify-end">
            {/* Mock Illustration */}
            <div className="relative w-80 h-96">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-2xl"
              />
              <div className="absolute inset-4 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-[32px] border border-white/5" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-12 bg-white/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Smart Recommendations */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold">{t("smartRecommendations")}</h2>
          </div>
          <Link href="/flashcards/priorities" className="text-sm font-semibold text-blue-500 hover:underline">
            {t("viewPriority")}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Due Today */}
          <div className="rounded-[24px] border-none bg-orange-50/30 dark:bg-orange-950/20 hover:shadow-xl transition-all duration-300 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/40">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <AnimatedProgressRing
                value={80}
                size={64}
                strokeWidth={6}
                variant="warning"
                className="text-orange-500"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">{t("dueToday")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("cardsReadyReview", { count: stats?.dueToday ?? 12 })}
              </p>
            </div>
            <Button
              onClick={() => startStudy({ virtualDeck: "due_today", limit: 25 })}
              className="w-full rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-black hover:opacity-90 transition-opacity h-14 font-bold text-base px-8"
            >
              {t("startSession")}
            </Button>
          </div>

          {/* Needs Attention */}
          <div className="rounded-[24px] border-none bg-rose-50/30 dark:bg-rose-950/20 hover:shadow-xl transition-all duration-300 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/40">
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <AnimatedProgressRing
                value={35}
                size={64}
                strokeWidth={6}
                variant="error"
                className="text-rose-500"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">{t("needsAttention")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("cardsNeedReview", { count: stats?.needsAttention ?? 8 })}
              </p>
            </div>
            <Button
              onClick={() => startStudy({ virtualDeck: "needs_attention", limit: 25 })}
              className="w-full rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-black hover:opacity-90 transition-opacity h-14 font-bold text-base px-8"
            >
              {t("studyNow")}
            </Button>
          </div>

          {/* Company Focus */}
          <div className="rounded-[24px] border-none bg-blue-50/30 dark:bg-blue-950/20 hover:shadow-xl transition-all duration-300 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/40">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge className="bg-cyan-500 hover:bg-cyan-600 text-[10px] font-bold py-1 px-3">NEW</Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Company Focus</h3>
              <p className="text-sm text-muted-foreground">
                Admin-prioritized categories: 2024 Compliance.
              </p>
            </div>
            <Button
              onClick={() => startStudy({ virtualDeck: "company_focus", limit: 25 })}
              className="w-full rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-black hover:opacity-90 transition-opacity h-14 font-bold text-base px-8"
            >
              Go to Deck
            </Button>
          </div>
        </div>
      </section>

      {/* 3. My Decks */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-teal-500" />
            </div>
            <h2 className="text-2xl font-bold">
              {t("yourDecks")}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({currentDeckCount}/{maxDecks == null || maxDecks < 0 ? "∞" : maxDecks})
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 bg-muted rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-background shadow-sm" : "hover:bg-background/50")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-background shadow-sm" : "hover:bg-background/50")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button
              variant="outline"
              className="rounded-xl h-11 px-6"
              onClick={() => setShareDialogOpen(true)}
              disabled={decks.length === 0}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Link href="/flashcards/deck-builder">
              <Button className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white border-none font-bold h-11 px-8">
                <Plus className="mr-2 h-4 w-4" />
                New Deck
              </Button>
            </Link>
          </div>
        </div>

        <ShareDecksDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          decks={decks}
          onSuccess={() => {
            api.get("/flashcards/home").then((res) => {
              setData(res.data?.data ?? res.data);
            });
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {decks.map((deck) => {
            const theme = getCategoryTheme(deck.categoryName || deck.name);
            const Icon = theme.icon;
            const visibleCount = (deck.cardIds?.length ?? 0) - (deck.hiddenCardIds?.length ?? 0);

            return (
              <motion.div
                key={deck.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="group relative"
              >
                <div
                  onClick={() => startStudy({ deckId: deck.id, limit: 25 })}
                  className="h-full rounded-[24px] overflow-hidden border border-border bg-card dark:bg-slate-900 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col shadow-sm"
                >
                  <div
                    className="h-40 relative flex items-center justify-center overflow-hidden force-bg"
                    style={{ "--custom-bg": theme.color }}
                  >
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute top-4 left-4 p-2 rounded-lg bg-white/20 backdrop-blur-md">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <Link
                      href={`/flashcards/decks/${deck.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-4 right-4 p-2 rounded-lg bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors z-10"
                      title={t("editDeck")}
                    >
                      <Pencil className="w-5 h-5 text-white" />
                    </Link>
                    <Icon className="w-20 h-20 text-white/20 absolute -bottom-4 -right-4 rotate-12" />
                    <div className="z-10 text-center space-y-1">
                      <span className="text-[10px] font-black tracking-widest text-white/60 uppercase">{theme.label}</span>
                      <h4 className="text-xl font-bold text-white px-4">{deck.name}</h4>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between bg-card text-card-foreground flex-1">
                    <div>
                      <p className="text-sm font-bold text-foreground line-clamp-1">{theme.sub}</p>
                      <p className="text-xs text-muted-foreground">{visibleCount} Cards</p>
                    </div>
                    <div className="p-2.5 rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Create First Deck Placeholder */}
          {canCreateDeck && (
            <Link href="/flashcards/deck-builder">
              <Card className="h-full rounded-[24px] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-transparent flex flex-col items-center justify-center p-8 text-center group hover:border-cyan-500 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4 group-hover:bg-cyan-500 transition-colors">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  {decks.length > 0 ? "Create New Deck" : "Create First Deck"}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {decks.length > 0
                    ? "Add another set to your collection and keep growing."
                    : "Your personalized learning sanctuary starts here."}
                </p>
              </Card>
            </Link>
          )}
        </div>
      </section>

      {/* Shared with you */}
      {sharedDecks.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold">{t("sharedWithYou")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sharedDecks.map((d) => (
              <Card
                key={d.id}
                className="rounded-[24px] overflow-hidden border hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{d.name}</CardTitle>
                  <CardDescription>
                    {d.cardCount} cards · by {d.ownerUsername}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    disabled={acceptingDeckId === d.id}
                    onClick={(e) => handleAcceptDeck(d.id, e)}
                  >
                    {acceptingDeckId === d.id ? (
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Accept
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 4. Explore Knowledge Areas */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold">Explore Knowledge Areas</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => {
            const theme = getCategoryTheme(cat.name);
            const Icon = theme.icon;
            return (
              <div
                key={cat.id}
                onClick={() => startStudy({ categoryIds: [cat.id], limit: 25 })}
                className="p-8 rounded-[24px] border-none text-white cursor-pointer hover:scale-[1.02] transition-transform flex flex-col items-center text-center gap-4 shadow-sm force-bg"
                style={{ "--custom-bg": theme.color }}
              >
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-white uppercase tracking-wider text-sm">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Bottom Call to Action */}
      <section className="relative rounded-[40px] border border-cyan-500/10 overflow-hidden bg-slate-50 dark:bg-slate-900/50 p-12 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-400/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-20 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center">
                <Zap className="w-8 h-8 text-cyan-400 fill-cyan-400" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"
              />
            </div>
          </div>

          <h3 className="text-3xl font-bold">
            {decks.length > 0 ? "Keep that learning momentum going!" : "Ready for your first mastery breakthrough?"}
          </h3>
          <p className="text-muted">
            {decks.length > 0
              ? "Expand your knowledge by creating a new deck or continue mastering your current ones."
              : "Create a custom deck or import from your team's shared library. Our smart algorithms will handle the repetition schedule for you."}
          </p>

          <Link href="/flashcards/deck-builder">
            <Button size="lg" className="rounded-4xl bg-cyan-500 hover:bg-cyan-600 border-none px-14 font-bold text-white h-16 text-lg shadow-xl shadow-cyan-500/20 mt-4">
              {decks.length > 0 ? "Create Another Deck" : "Create Your First Deck"}
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
