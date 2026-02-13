"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@skill-learn/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@skill-learn/ui/components/select";
import { Loader } from "@skill-learn/ui/components/loader";
import { Sliders } from "lucide-react";
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import api from "@skill-learn/lib/utils/axios";
import { toast } from "sonner";

export default function FlashCardPrioritiesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingPriority, setSavingPriority] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/flashcards/priorities");
      const data = res.data?.data ?? res.data;
      setCategories(data.categories ?? []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load priorities");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (categoryId, priority) => {
    try {
      setSavingPriority(categoryId);
      await api.post("/flashcards/priorities", { categoryId, priority });
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, priority } : c))
      );
      toast.success("Priority updated");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update priority");
    } finally {
      setSavingPriority(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <BreadCrumbCom
        crumbs={[
          { name: "Flash Cards", href: "/flashcards" },
          { name: "My Priorities", href: "/flashcards/priorities" },
        ]}
        endtrail="My Priorities"
      />
      <div className="max-w-2xl mx-auto space-y-6 pb-8">
        <div>
          <h1 className="text-2xl font-bold">My Category Priorities</h1>
          <p className="text-muted-foreground mt-1">
            Set your preferred focus (1–10). Higher priority categories appear more often in mixed study sessions. Your choices may be overridden by admin settings.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              Category Priorities
            </CardTitle>
            <CardDescription>
              1 = lowest, 10 = highest focus during study
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader variant="gif" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No flash card categories yet.</p>
                <p className="text-sm mt-1">
                  <Link href="/flashcards/create-category" className="text-primary hover:underline">
                    Create a category
                  </Link>{" "}
                  or browse flash cards to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium truncate block">{c.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {c.cardCount} card{c.cardCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <Select
                      value={String(c.priority)}
                      onValueChange={(v) => {
                        const num = Number(v);
                        setCategories((prev) =>
                          prev.map((cat) =>
                            cat.id === c.id ? { ...cat, priority: num } : cat
                          )
                        );
                        handlePriorityChange(c.id, num);
                      }}
                      disabled={savingPriority === c.id}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/flashcards">
            <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
              ← Back to Flash Cards
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
