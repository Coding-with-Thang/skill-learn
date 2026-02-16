"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Gamepad2,
  BookOpen,
  Zap,
  Star,
  ChevronRight,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Target
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export default function VideoAdPage() {
  const t = useTranslations("videoAd");
  
  const scenes = [
    {
      id: "pain",
      title: t("employeeTrainingBoring"),
      subtitle: t("endlessPdfs"),
      color: "bg-slate-900",
      textStyle: "text-slate-400",
    },
    {
      id: "hook",
      title: t("notAnymore"),
      subtitle: t("transformPotential"),
      color: "bg-indigo-950",
      textStyle: "text-white",
      image: "/ad-hero.png",
    },
    {
      id: "gamify",
      title: t("playLearnWin"),
      subtitle: t("gamifiedLearning"),
      color: "bg-teal-950",
      textStyle: "text-teal-100",
      icons: [Gamepad2, BrainCircuit, Target],
    },
    {
      id: "rewards",
      title: t("rewardsForGrowth"),
      subtitle: t("earnPoints"),
      color: "bg-purple-950",
      textStyle: "text-purple-100",
      icons: [Trophy, Star, Sparkles],
    },
    {
      id: "cta",
      title: t("futureOfLearning"),
      subtitle: t("joinNextGen"),
      color: "bg-black",
      textStyle: "text-white",
      cta: true,
    }
  ];
  const [currentScene, setCurrentScene] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setTimeout(() => {
      if (currentScene < scenes.length - 1) {
        setCurrentScene(currentScene + 1);
      } else {
        setIsAutoPlaying(false);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentScene, isAutoPlaying]);

  const restart = () => {
    setCurrentScene(0);
    setIsAutoPlaying(true);
  };

  const scene = scenes[currentScene];
  if (!scene) return null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000 ${scene.color}`}>
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center"
        >
          {scene.image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 1, type: "spring" }}
              className="relative w-full aspect-video mb-12 rounded-4xl overflow-hidden shadow-2xl border border-white/10"
            >
              <Image
                src={scene.image}
                alt="Skill-Learn"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            </motion.div>
          )}

          {scene.icons && (
            <div className="flex gap-8 mb-12">
              {scene.icons.map((Icon, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + (idx * 0.2), type: "spring" }}
                  className="w-20 h-20 rounded-4xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl"
                >
                  <Icon className="w-10 h-10 text-white" />
                </motion.div>
              ))}
            </div>
          )}

          <motion.h1
            className={`text-6xl md:text-8xl font-bold mb-6 tracking-tight ${scene.textStyle}`}
            layoutId="title"
          >
            {scene.title}
          </motion.h1>

          <motion.p
            className={`text-xl md:text-3xl font-medium opacity-80 max-w-2xl ${scene.textStyle}`}
            layoutId="subtitle"
          >
            {scene.subtitle}
          </motion.p>

          {scene.cta && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex flex-col md:flex-row gap-6"
            >
              <Link
                href="/sign-in"
                className="px-12 py-5 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-transform shadow-2xl flex items-center gap-2 group"
              >
                {t("getStartedFree")}
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={restart}
                className="px-12 py-5 bg-white/10 backdrop-blur-md text-white font-bold text-xl rounded-full hover:bg-white/20 transition-all border border-white/30 flex items-center gap-2"
              >
                <RotateCcw className="w-6 h-6" />
                {t("replayAd")}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
          <motion.div
            key={currentScene}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "linear" }}
            className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          />
        </div>
      )}

      {/* Footer Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute top-8 left-8 flex items-center gap-3"
      >
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-black text-xl shadow-lg">
          S
        </div>
        <span className="text-white font-bold text-2xl tracking-tight">Skill-Learn</span>
      </motion.div>

      {/* Skip/Next Button */}
      {isAutoPlaying && (
        <button
          onClick={() => {
            if (currentScene < scenes.length - 1) {
              setCurrentScene(currentScene + 1);
            } else {
              setIsAutoPlaying(false);
            }
          }}
          className="absolute bottom-8 right-8 px-6 py-3 bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-black/60 transition-colors flex items-center gap-2 text-sm font-semibold"
        >
          {t("skipScene")} <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Audio Visualization (Fake) */}
      <div className="absolute bottom-8 left-8 flex items-end gap-1 h-8 opacity-40">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ height: [8, 24, 12, 32, 16, 28, 8] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1, ease: i % 2 === 0 ? "easeInOut" : "linear" }}
            className="w-1.5 bg-white rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
