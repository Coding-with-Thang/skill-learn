"use client"

import { useEffect, useState } from "react";
import TopBanner from "@/components/layout/TopBanner";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import { ScrollToTop } from "@/components/shared/ScrollToTop";

export default function PublicLayout({ children }) {
  const [loaded, setLoaded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mql.matches);

    if (mql.matches) {
      // If user prefers reduced motion, immediately mark loaded to skip animations.
      setLoaded(true);
      return;
    }

    // Small delay so CSS animations appear after paint (avoids jank)
    const id = setTimeout(() => setLoaded(true), 55);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:rounded-4xld focus:shadow-md focus:ring-2 focus:ring-teal-500"
      >
        Skip to main content
      </a>

      {/* Top banner + header — these components provide their own semantics */}
      <div
        role="region"
        aria-label="Marketing header"
        aria-hidden={reduceMotion ? undefined : !loaded}
        className={`overflow-hidden ${reduceMotion ? "" : loaded ? "animate-fade-in-up" : "opacity-0 translate-y-3"}`}
      >
        <TopBanner />
        <LandingHeader />
      </div>

      {/* Main content area with a clear landmark for screen readers and keyboard focus management */}
      <main id="main-content" role="main" tabIndex={-1} className="flex-1">
        {/* Smooth fade/slide for content so transitions feel pleasant */}
        <div
          className={`mx-auto transition-transform duration-300 ease-out ${reduceMotion ? "" : loaded ? "animate-scale-in" : "opacity-0 translate-y-2"}`}
        >
          {children}
        </div>
      </main>

      {/* Footer */}
      <div
        role="contentinfo"
        aria-label="Marketing footer"
        aria-hidden={reduceMotion ? undefined : !loaded}
        className={`overflow-hidden ${reduceMotion ? "" : loaded ? "animate-slide-in-right" : "opacity-0 translate-x-3"}`}
      >
        <LandingFooter />
      </div>
      <ScrollToTop />
    </div>
  );
}
