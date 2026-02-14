"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@skill-learn/lib/utils"
import { Card } from "./card"

const loaderVariants = {
  spinner: "spinner",
  page: "page",
  card: "card",
  gif: "gif",
  fullscreen: "fullscreen"
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
  icon: "h-4 w-4"
}

/**
 * Unified Loader Component
 *
 * Use for consistent loading UX; prefer over raw Loader2 from lucide-react.
 *
 * @param {string} variant - 'spinner', 'page', 'card', 'gif', 'fullscreen'
 * @param {string} size - 'sm', 'md', 'lg', 'xl', 'icon'
 * @param {string} [className] - Additional classes
 * @param {string} [text] - Optional custom text (e.g. "Deleting...", "Saving..."). Shown beside spinner; for gif/page/fullscreen used as subtitle.
 * @param {object} props - Additional props
 *
 * @example
 * <Loader variant="spinner" size="md" />
 * <Loader variant="spinner" text="Deleting..." />
 * <Loader variant="page" text="Unlocking awesome insights..." />
 */
export function Loader({
  variant = "spinner",
  size = "md",
  className,
  text,
  ...props
}) {
  // Default Spinner (optional custom text e.g. "Deleting...", "Saving...")
  if (variant === "spinner") {
    const icon = (
      <Loader2
        className={cn(
          "animate-spin text-muted-foreground shrink-0",
          sizeClasses[size] || sizeClasses.md
        )}
        aria-hidden={!!text}
      />
    )
    if (text) {
      return (
        <div
          className={cn("flex items-center justify-center gap-2", className)}
          role="status"
          aria-live="polite"
          {...props}
        >
          {icon}
          <span className="text-sm text-muted-foreground">{text}</span>
        </div>
      )
    }
    return (
      <Loader2
        className={cn(
          "animate-spin text-muted-foreground",
          sizeClasses[size] || sizeClasses.md,
          className
        )}
        {...props}
      />
    )
  }

  // GIF Loader (from shared/loader.jsx)
  if (variant === "gif") {
    return (
      <div className={cn("flex flex-col gap-2 justify-center items-center", className)} {...props}>
        <Image
          src="/loader.gif"
          alt={text || "Loading..."}
          height={300}
          width={300}
          unoptimized
          className={cn(
            size === "sm" && "h-16 w-16",
            size === "md" && "h-32 w-32",
            size === "lg" && "h-64 w-64",
            // Default explicit dimensions if no size override matches widely
          )}
        />
        {text && <p className="my-4 text-xl text-muted-foreground">{text}</p>}
      </div>
    )
  }

  // Fullscreen / Page Loader (Animated & Premium)
  if (variant === "page" || variant === "fullscreen") {
    return <FullScreenLoader text={text} className={className} {...props} />
  }

  // Fallback
  return null
}

// ----------------------------------------------------------------------
// Premium Full Screen Loader Implementation
// ----------------------------------------------------------------------

import { motion } from "framer-motion"
import {
  GraduationCap,
  Sparkles,
  Rocket,
  PartyPopper,
  Wand2,
  Medal,
  Zap,
  Lightbulb,
} from "lucide-react"

const FloatingIcon = ({ icon: Icon, delay = 0, x, y, color, size = 6 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0.5, 1, 1, 0.5],
      y: [0, -20, -40]
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut",
      times: [0, 0.2, 0.8, 1]
    }}
    className={cn("absolute pointer-events-none", color)}
    style={{ left: x, top: y, zIndex: 10 }}
  >
    <div className={cn("p-3 rounded-4xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20")}>
      <Icon className={`w-${size} h-${size}`} />
    </div>
  </motion.div>
);

const FullScreenLoader = ({ text }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col h-screen w-screen bg-slate-50 dark:bg-[#0F172A] overflow-hidden">
      {/* Background Gradients - pushed to back */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-200">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -45, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-[100px]"
        />
      </div>

      {/* Floating Icons around center - clearly positioned */}
      <div className="absolute inset-0 pointer-events-none z-10 w-full h-full">
        {/* Top Left */}
        <FloatingIcon icon={Rocket} delay={0} x="10%" y="15%" color="text-orange-500 bg-orange-500/10" size={6} />

        {/* Bottom Left */}
        <FloatingIcon icon={Zap} delay={1.5} x="15%" y="75%" color="text-yellow-500 bg-yellow-500/10" size={5} />

        {/* Top Right */}
        <FloatingIcon icon={Sparkles} delay={0.5} x="85%" y="20%" color="text-purple-500 bg-purple-500/10" size={6} />

        {/* Middle Right */}
        <FloatingIcon icon={PartyPopper} delay={2} x="80%" y="50%" color="text-pink-500 bg-pink-500/10" size={5} />

        {/* Bottom Right */}
        <FloatingIcon icon={Lightbulb} delay={3} x="75%" y="80%" color="text-amber-500 bg-amber-500/10" size={5} />
      </div>

      {/* Main Content - Flex-1 to push footer down, centered content */}
      <div className="relative z-30 flex-1 flex flex-col items-center justify-center w-full px-6 text-center">
        <div className="max-w-lg w-full flex flex-col items-center">
          {/* Central Logo / Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 relative"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 rounded-full border border-dashed border-slate-300 dark:border-slate-700"
            />

            <div className="w-24 h-24 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl shadow-indigo-500/20 flex items-center justify-center relative z-10">
              <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl" />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-linear-to-br from-orange-400 to-orange-600 rounded-xl p-4 shadow-lg shadow-orange-500/30 transform rotate-3"
              >
                <GraduationCap className="w-8 h-8 text-white" />
              </motion.div>
            </div>

            {/* Floating mini-badge */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute -top-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-[#0F172A] z-2000"
            >
              <Sparkles className="w-3 h-3" />
            </motion.div>
          </motion.div>

          {/* Brand Name */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight"
          >
            Skill-Learn<span className="text-orange-500">.</span>
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-12"
          >
            People-First
          </motion.p>


          {/* Main Text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              Your potential is <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400">powering up!</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
              {text || "Unlocking awesome insights just for you..."}
            </p>
          </motion.div>

          {/* Steps / Icons Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-8 mb-10"
          >
            {[
              { Icon: Rocket, color: "text-orange-500" },
              { Icon: PartyPopper, color: "text-pink-500" },
              { Icon: Wand2, color: "text-teal-500" },
              { Icon: Medal, color: "text-yellow-500" },
            ].map(({ Icon, color }, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              >
                <Icon className={cn("w-6 h-6 opacity-80", color)} />
                <motion.div
                  className={cn("w-1.5 h-1.5 rounded-full mx-auto mt-2 opacity-50", color.replace('text-', 'bg-'))}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Progress Bar (Indeterminate) */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative mb-4">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-1/2 h-full bg-linear-to-r from-orange-400 via-pink-500 to-indigo-500 rounded-full"
            />
          </div>

          <p className="text-[10px] font-bold tracking-[0.2em] text-orange-500 uppercase">
            OPTIMIZING YOUR LEARNING JOURNEY
          </p>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-30 shrink-0 pb-10 pt-4 flex flex-col items-center gap-4 text-center px-4 mt-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase">
            AI-Enhanced • Human-Centered • Ready to Learn
          </span>
        </div>
        <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
          Built for Humans • Powered by Imagination
        </p>
      </motion.div>
    </div>
  )
}


