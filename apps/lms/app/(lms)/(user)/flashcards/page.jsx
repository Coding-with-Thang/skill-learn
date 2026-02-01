"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  BookOpen,
  Layers,
  Plus,
  ChevronRight,
  Clock,
  AlertCircle,
  Target,
} from "lucide-react";
import BreadCrumbCom from "@/components/shared/BreadCrumb";

export default function FlashCardsHomePage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/flashcards/home")
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setData(d);
      })
      .catch(() => setData({ decks: [], categories: [], recommended: [], stats: {} }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader variant="gif" />;

  const { decks = [], categories = [], recommended = [], stats = {} } = data ?? {};

  const startStudy = (params = {}) => {
    const q = new URLSearchParams();
    if (params.deckId) q.set("deckId", params.deckId);
    if (params.virtualDeck) q.set("virtualDeck", params.virtualDeck);
    if (params.categoryIds) {
      q.set("categoryIds", Array.isArray(params.categoryIds)
        ? params.categoryIds.join(",")
        : params.categoryIds);
    }
    if (params.limit) q.set("limit", String(params.limit));
    const search = q.toString();
    router.push(`/flashcards/study${search ? `?${search}` : ""}`);
  };

  return (
    <>
      <BreadCrumbCom crumbs={[{ name: "Flash Cards", href: "/flashcards" }]} />
      <div className="max-w-4xl mx-auto space-y-8 pb-8">
        <div>
          <h1 className="text-3xl font-bold">Flash Cards</h1>
          <p className="text-muted-foreground mt-1">
            Study with spaced repetition. Create decks, browse categories, or dive into recommended sets.
          </p>
        </div>

        {/* Recommended (virtual decks) */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {recommended.map((rec) => (
              <Card
                key={rec.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  if (rec.id === "due-today")
                    startStudy({ virtualDeck: "due_today", limit: 25 });
                  else if (rec.id === "needs-attention")
                    startStudy({ virtualDeck: "needs_attention", limit: 25 });
                  else if (rec.id === "company-focus" && rec.studyParams?.categoryIds?.length)
                    startStudy({
                      categoryIds: rec.studyParams.categoryIds,
                      virtualDeck: "company_focus",
                      limit: 25,
                    });
                  else startStudy({ limit: 25 });
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {rec.id === "due-today" && <Clock className="h-5 w-5 text-amber-500" />}
                    {rec.id === "needs-attention" && <AlertCircle className="h-5 w-5 text-orange-500" />}
                    {rec.id === "company-focus" && <Target className="h-5 w-5 text-blue-500" />}
                    <CardTitle className="text-base">{rec.name}</CardTitle>
                  </div>
                  <CardDescription>{rec.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{rec.cardCount} cards</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Continue studying - quick action */}
        {(stats.dueToday > 0 || stats.needsAttention > 0) && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Continue Studying</h2>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => startStudy({ limit: 25 })}
            >
              <CardContent className="flex items-center justify-between py-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Start study session</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.dueToday > 0 && `${stats.dueToday} cards due`}
                      {stats.dueToday > 0 && stats.needsAttention > 0 && " · "}
                      {stats.needsAttention > 0 && `${stats.needsAttention} need attention`}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </section>
        )}

        {/* Quick actions */}
        <div className="flex gap-3">
          <Link href="/flashcards/create-card">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Card
            </Button>
          </Link>
          <Link href="/flashcards/create-category">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </Link>
        </div>

        {/* My Decks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Decks</h2>
            <Link href="/flashcards/deck-builder">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Deck
              </Button>
            </Link>
          </div>
          {decks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No decks yet. Create one to get started.</p>
                <Link href="/flashcards/deck-builder">
                  <Button className="mt-4">Create Deck</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {decks.map((deck) => (
                <Card
                  key={deck.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => startStudy({ deckId: deck.id, limit: 25 })}
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{deck.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {deck.cardIds?.length ?? 0} cards
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Browse Categories */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Browse Categories</h2>
          {categories.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No categories yet. Admins can create categories.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <Card
                  key={cat.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => startStudy({ categoryIds: [cat.id], limit: 25 })}
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {cat._count?.flashCards ?? 0} cards
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
