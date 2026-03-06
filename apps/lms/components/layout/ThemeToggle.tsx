"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@skill-learn/ui/components/button";
import { useThemeStore } from "@/lib/store";

/**
 * Light/dark theme toggle matching CMS: Sun/Moon icon button with animation.
 * Uses LMS theme store (lms-theme in localStorage).
 * Renders a consistent placeholder until mounted to avoid hydration mismatch
 * (server has no localStorage, client may have different saved theme).
 */
export default function ThemeToggle() {
  const t = useTranslations("themeToggle");
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const init = useThemeStore.getState().initializeTheme;
    if (typeof init === "function") init();
    setMounted(true);
  }, []);

  // During SSR and initial hydration, render a stable placeholder to avoid mismatch.
  // Server always renders "light" (Sun). After mount, we show the real theme.
  const displayTheme = mounted ? theme : "light";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative"
      aria-label={displayTheme === "light" ? t("toggleDark") : t("toggleLight")}
      suppressHydrationWarning
    >
      <AnimatePresence mode="wait">
        {displayTheme === "light" ? (
          <motion.div
            key="sun"
            initial={mounted ? { rotate: -90, opacity: 0 } : false}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={mounted ? { rotate: 90, opacity: 0 } : false}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
