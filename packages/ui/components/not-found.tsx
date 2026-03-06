"use client";

import Link from "next/link";
import { Button } from "./button";
import { Home, Search } from "lucide-react";

/**
 * Shared NotFound component for 404 pages
 * @param {Object} props
 * @param {string} props.homeHref - The href to navigate home (default: "/")
 * @param {string} props.homeLabel - The label for the home button (default: "Go back home")
 * @param {string} props.title - Custom title (default: "Oops! Page not found.")
 * @param {string} props.description - Custom description
 * @param {string} props.searchLabel - Optional label for search button
 * @param {string} props.searchHref - Optional href for search button
 */
export function NotFound({
  homeHref = "/",
  homeLabel = "Go back home",
  title = "Oops! Page not found.",
  description = "Sorry, we couldn't find the page you're looking for.",
  searchLabel,
  searchHref = "/courses"
}) {
  const parts = title.split("learning break");

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center p-4 overflow-hidden bg-background">
      {/* Sophisticated Grainy Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.15] dark:opacity-[0.1]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Subtle Color Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-400/10 dark:bg-teal-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Gigantic Background 404 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span className="text-[20rem] md:text-[30rem] font-black text-slate-500/5 dark:text-slate-100/5 leading-none transition-all duration-700">
          404
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl px-6">
        {/* Custom Icon: Graduation Cap + Open Book */}
        <div className="mb-10 animate-fade-in-down">
          <div className="relative w-32 h-32 md:w-40 md:h-40">
            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
              <path
                d="M60 100V40C60 40 45 35 20 35V90C45 90 60 95 60 100Z"
                stroke="#0D9488"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M60 100V40C60 40 75 35 100 35V90C75 90 60 95 60 100Z"
                stroke="#0D9488"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M60 10L105 30L60 50L15 30L60 10Z"
                fill="#2563EB"
              />
              <path
                d="M100 30V55C100 55 85 70 60 70C35 70 20 55 20 55V30"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M105 30L115 60" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
              <circle cx="115" cy="62" r="5" fill="#2563EB" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-50 mb-8 leading-tight">
          {parts[0]}
          {parts.length > 1 && (
            <span className="italic relative md:inline block mt-2 md:mt-0">
              <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                learning break
              </span>
            </span>
          )}
          {parts[1]}
        </h1>

        <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
          <Button
            asChild
            size="lg"
            className="h-14 px-10 rounded-2xl bg-gradient-to-br from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white font-bold text-lg shadow-2xl shadow-teal-500/30 transition-all hover:scale-105 active:scale-95 group"
          >
            <Link href={homeHref} className="flex items-center gap-3">
              <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              {homeLabel}
            </Link>
          </Button>

          {searchLabel && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-10 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl text-slate-700 dark:text-slate-300 font-bold text-lg hover:bg-white dark:hover:bg-slate-800 shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <Link href={searchHref} className="flex items-center gap-3">
                <Search className="w-5 h-5" />
                {searchLabel}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
