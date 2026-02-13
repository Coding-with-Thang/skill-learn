"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import { Label } from "@skill-learn/ui/components/label";
import { Textarea } from "@skill-learn/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@skill-learn/ui/components/select";
import { Loader } from "@skill-learn/ui/components/loader";
import { Upload } from "lucide-react";
import api from "@skill-learn/lib/utils/axios";
import { toast } from "sonner";

/**
 * Parse CSV: question,answer (or question;answer)
 * Lines with empty question/answer are skipped
 */
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const cards = [];
  for (const line of lines) {
    const parts = line.includes(";")
      ? line.split(";").map((s) => s.trim())
      : line.split(",").map((s) => s.trim());
    if (parts.length >= 2 && parts[0] && parts[1]) {
      cards.push({
        question: parts[0],
        answer: parts[1],
      });
    }
  }
  return cards;
}

/**
 * Parse JSON: [{ question, answer, tags?, difficulty? }]
 */
function parseJSON(text) {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.cards ?? [];
  return arr
    .filter((r) => r && r.question && r.answer)
    .map((r) => ({
      question: String(r.question).trim(),
      answer: String(r.answer).trim(),
      tags: Array.isArray(r.tags) ? r.tags : [],
      difficulty: typeof r.difficulty === "number" ? r.difficulty : undefined,
    }));
}

export default function FlashCardsImportPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [rawInput, setRawInput] = useState("");
  const [format, setFormat] = useState("csv"); // csv | json

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/flashcards/priorities");
      const data = res.data?.data ?? res.data;
      const cats = data.categories ?? [];
      setCategories(cats);
      if (cats.length && !categoryId) setCategoryId(cats[0].id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- categoryId omitted to avoid refetch on category change
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      const ext = file.name.toLowerCase().split(".").pop();
      if (ext === "json") {
        setFormat("json");
        try {
          const parsed = parseJSON(text);
          setRawInput(JSON.stringify(parsed, null, 2));
        } catch {
          setRawInput(text);
        }
      } else {
        setFormat("csv");
        setRawInput(text);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!categoryId) {
      toast.error("Select a category");
      return;
    }
    if (!rawInput.trim()) {
      toast.error("Paste or upload content");
      return;
    }

    let cards;
    try {
      if (format === "json") {
        cards = parseJSON(rawInput);
      } else {
        cards = parseCSV(rawInput);
      }
    } catch (err) {
      toast.error("Invalid format. Check your input.");
      return;
    }

    if (cards.length === 0) {
      toast.error("No valid cards found");
      return;
    }

    setImporting(true);
    try {
      const res = await api.post("/admin/flashcards/import", {
        categoryId,
        cards,
      });
      const data = res.data?.data ?? res.data;
      toast.success(
        `Imported ${data.created ?? 0} cards${(data.skipped ?? 0) > 0 ? `, ${data.skipped} skipped (duplicates)` : ""}`
      );
      setRawInput("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <Loader variant="gif" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bulk Import</h1>
        <p className="text-muted-foreground mt-1">
          Import flash cards from CSV or JSON.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Cards
          </CardTitle>
          <CardDescription>
            CSV: question,answer per line (or use ; as separator). JSON: array of {`{ "question", "answer", "tags?", "difficulty?" }`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-48 mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="w-32 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.json"
                    className="hidden"
                    onChange={handleFile}
                  />
                  Upload file
                </label>
              </Button>
            </div>
          </div>

          <div>
            <Label>Paste content or upload a file</Label>
            <Textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={
                format === "csv"
                  ? "What is 2+2?,4\nCapital of France?,Paris"
                  : '[{"question":"...","answer":"..."}]'
              }
              rows={12}
              className="font-mono text-sm mt-1"
            />
          </div>

          <Button onClick={handleImport} disabled={importing}>
            {importing ? "Importing…" : "Import"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
