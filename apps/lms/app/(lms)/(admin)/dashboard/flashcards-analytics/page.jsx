"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Badge } from "@skill-learn/ui/components/badge";
import { Loader } from "@skill-learn/ui/components/loader";
import { RefreshCw, Check, X, Lightbulb, TrendingUp, TrendingDown } from "lucide-react";
import api from "@skill-learn/lib/utils/axios.js";
import { toast } from "sonner";

export default function FlashCardsAnalyticsPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [actingId, setActingId] = useState(null);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/flashcards/suggestions");
      const data = res.data?.data ?? res.data;
      setSuggestions(data.suggestions ?? []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load suggestions");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await api.post("/admin/flashcards/suggestions/generate");
      const data = res.data?.data ?? res.data;
      toast.success(`Generated ${data.generated ?? 0} new suggestion(s)`);
      await fetchSuggestions();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to generate suggestions");
    } finally {
      setGenerating(false);
    }
  };

  const handleAction = async (suggestionId, action) => {
    try {
      setActingId(suggestionId);
      await api.post(`/admin/flashcards/suggestions/${suggestionId}`, { action });
      toast.success(action === "apply" ? "Priority updated" : "Suggestion dismissed");
      await fetchSuggestions();
    } catch (err) {
      toast.error(err.response?.data?.error || "Action failed");
    } finally {
      setActingId(null);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Flash Cards Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Priority suggestions based on learning analytics. Apply or dismiss each suggestion—changes are never auto-applied.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Priority Suggestions
              </CardTitle>
              <CardDescription>
                High exposure + low mastery → increase priority. High mastery + high exposure → decrease priority.
              </CardDescription>
            </div>
            <Button onClick={handleGenerate} disabled={generating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Generating…" : "Generate Suggestions"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader variant="gif" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No pending suggestions.</p>
              <p className="text-sm mt-1">Click &quot;Generate Suggestions&quot; to run the aggregation.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((s) => {
                const isIncrease = s.suggestedPriority > (s.currentPriority ?? 5);
                return (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{s.categoryName}</span>
                        <Badge variant={isIncrease ? "default" : "secondary"}>
                          {isIncrease ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {s.currentPriority ?? 5} → {s.suggestedPriority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{s.reason}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleAction(s.id, "apply")}
                        disabled={actingId === s.id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(s.id, "dismiss")}
                        disabled={actingId === s.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
