"use client";

import { useEffect, useState } from "react";
import { Search, Command, X, ArrowRight, Zap, Book, GraduationCap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@skill-learn/ui/components/dialog";
import { cn } from "@skill-learn/lib/utils.js";
import { useRouter } from "next/navigation";

export function SearchCommand({ isOpen, setIsOpen }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  // Mock results for demonstration
  const mockResults = [
    { id: 1, title: "React Fundamentals", type: "Course", category: "Programming", icon: Book },
    { id: 2, title: "Advanced CSS Layouts", type: "Course", category: "Design", icon: Book },
    { id: 3, title: "JavaScript ES6+ Quiz", type: "Quiz", category: "Programming", icon: GraduationCap },
    { id: 4, title: "UI/UX Best Practices", type: "Course", category: "Design", icon: Book },
  ];

  const filteredResults = query
    ? mockResults.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    )
    : [];

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setIsOpen]);

  const handleSelect = (id) => {
    setIsOpen(false);
    // In a real app, route to the specific content
    // router.push(`/courses/${id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-background/80 backdrop-blur-xl shadow-2xl rounded-3xl">
        <DialogHeader className="p-4 border-b border-border/50">
          <DialogTitle className="sr-only">Search Knowledge Base</DialogTitle>
          <div className="flex items-center gap-3 px-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground"
              placeholder="Search your knowledge base..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">ESC</span>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query === "" ? (
            <div className="p-4 space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">Suggested</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mockResults.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className="flex items-center gap-3 p-3 rounded-4xl hover:bg-muted transition-colors text-left group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">{item.category} • {item.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="p-2 space-y-1">
              {filteredResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="w-full flex items-center justify-between p-3 rounded-4xl hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-4">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-bold">No results found</p>
                <p className="text-sm text-muted-foreground">We couldn't find anything matching "{query}"</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-muted/30 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ArrowRight className="h-3 w-3" /> to select
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" /> search shortcuts
            </span>
          </div>
          <p>Skill-Learn v0.0.4</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
