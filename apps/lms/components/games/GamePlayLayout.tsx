"use client";

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Calendar,
  HelpCircle,
  Settings,
  Bell,
  ChevronRight,
  RotateCcw,
  Pause,
  Play,
  Lightbulb,
  ShieldCheck,
  User
} from 'lucide-react';
import { Button } from "@skill-learn/ui/components/button";
import { Progress } from "@skill-learn/ui/components/progress";
import { Card, CardContent } from "@skill-learn/ui/components/card";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

// Inline placeholder so next/image never hits optimizer with API (avoids "received null" errors)
const PLACEHOLDER_SRC =
  "data:image/svg+xml," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#9ca3af"/></svg>');

type LeaderboardPlayer = { avatar?: string; name: string; score: number };

const GamePlayLayout = ({
  children,
  title,
  gameTitle,
  currentScore = 0,
  round = 1,
  totalRounds = 5,
  personalBest = 0,
  globalRank = "Unranked",
  rules = [],
  tip = "",
  leaderboard = [],
  onReset,
  onPause,
  onResume,
  isPaused = false
}: {
  children?: React.ReactNode;
  title?: string;
  gameTitle?: string;
  currentScore?: number;
  round?: number;
  totalRounds?: number;
  personalBest?: number;
  globalRank?: string;
  rules?: string[];
  tip?: string;
  leaderboard?: LeaderboardPlayer[];
  onReset?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  isPaused?: boolean;
}) => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-linear-to-br from-[#94D1CF] via-[#7CB9B6] to-[#5DA39F] text-[#1e293b] p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <Link href="/games">
            <Button variant="outline" className="rounded-full bg-white/90 hover:bg-white text-[#5DA39F] border-none shadow-sm gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-semibold">Back to Games</span>
            </Button>
          </Link>
          <div className="flex flex-col">
            <nav className="flex items-center text-[10px] uppercase tracking-wider font-bold text-brand-teal/60">
              <Link href="/home" className="hover:text-brand-teal">HOME</Link>
              <ChevronRight className="h-3 w-3 mx-1" />
              <Link href="/games" className="hover:text-brand-teal">GAMES</Link>
              <ChevronRight className="h-3 w-3 mx-1" />
              <span className="text-brand-teal">{title}</span>
            </nav>
            <h1 className="text-2xl font-black text-brand-teal mt-1">{title}: {gameTitle}</h1>
          </div>
        </div>


      </header>

      {/* Top Stats Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Current Score */}
        <Card className="bg-white/90 backdrop-blur-sm border-none rounded-4xl shadow-xl shadow-teal-900/10 overflow-hidden relative">

          <CardContent className="p-6 flex flex-col justify-between h-32 relative z-10">
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">CURRENT SCORE</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-800">{currentScore.toLocaleString()}</span>
              <span className="text-sm font-bold text-slate-400 uppercase">pts</span>
            </div>
          </CardContent>
        </Card>

        {/* Game Progress */}
        <Card className="bg-white/90 backdrop-blur-sm border-none rounded-4xl shadow-xl shadow-teal-900/10 overflow-hidden relative">

          <CardContent className="p-6 flex flex-col justify-between h-32 relative z-10">
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">GAME PROGRESS</p>
            <div>
              <p className="text-2xl font-black text-slate-800 mb-2">Round {round} <span className="text-slate-400 font-bold ml-1 text-lg">of {totalRounds}</span></p>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${(round / totalRounds) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Best */}
        <Card className="bg-linear-to-r from-cyan-400 to-cyan-500 border-none rounded-4xl shadow-xl shadow-cyan-600/20 overflow-hidden relative text-white">

          <CardContent className="p-6 flex flex-col justify-between h-32 relative z-10">
            <p className="text-[10px] uppercase font-black tracking-widest text-white/70">PERSONAL BEST</p>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-6 w-6 text-yellow-300 fill-yellow-300" />
                <span className="text-3xl font-black">{personalBest.toLocaleString()}</span>
              </div>
              <span className="text-[10px] font-bold bg-black/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 uppercase">
                Global Rank: {globalRank}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Leaderboard & Tip */}
        <div className="lg:col-span-3 space-y-8">
          {/* Leaderboard */}
          <Card className="bg-white border-none rounded-4xl shadow-xl shadow-teal-900/10 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6 text-[#5DA39F]">
                <TrendingUp className="h-5 w-5" />
                <h3 className="font-black text-xl text-slate-800">Leaderboard</h3>
              </div>
              <div className="space-y-4">
                {leaderboard.length > 0 ? leaderboard.map((player, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-4xl hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-2 ring-slate-100">
                          <Image src={player.avatar || PLACEHOLDER_SRC} alt={player.name} width={40} height={40} className="object-cover" unoptimized />
                        </div>
                        <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-slate-300' : 'bg-amber-600'
                          }`}>
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">{player.name}</span>
                        <span className="text-[10px] font-bold text-slate-400">{player.score.toLocaleString()} XP</span>
                      </div>
                    </div>
                    {idx === 0 && <ShieldCheck className="h-4 w-4 text-yellow-400" />}
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 text-center py-4 italic">No players yet</p>
                )}
              </div>
              <Button variant="link" className="w-full mt-6 text-[#5DA39F] font-bold text-xs uppercase tracking-wider hover:no-underline">
                View Full Standings
              </Button>
            </CardContent>
          </Card>

          {/* Game Master Tip */}
          <Card className="bg-white/40 backdrop-blur-md border border-white/30 rounded-4xl shadow-lg overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-2 mb-4 text-cyan-500">
                <Lightbulb className="h-5 w-5" />
                <h3 className="font-bold text-slate-800">Game Master Tip</h3>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                "{tip}"
              </p>
              <div className="mt-4 flex justify-end opacity-20">
                <Image src={PLACEHOLDER_SRC} alt="Mascot" width={40} height={40} className="grayscale" unoptimized />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column: Game Area */}
        <div className="lg:col-span-6">
          <Card className="bg-white/80 backdrop-blur-lg border-none rounded-[3.5rem] shadow-2xl shadow-teal-900/20 overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-8">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-slate-800 mb-2">Ready to Duel?</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Player vs AI Strategy Mode</p>
            </div>

            <div className="w-full flex-1 flex flex-col items-center justify-center">
              {children}
            </div>

            <div className="flex items-center gap-4 mt-12 pb-4">
              <Button
                onClick={onResume}
                className="h-14 px-8 rounded-4xl bg-cyan-400 hover:bg-cyan-500 text-white font-black text-lg gap-2 shadow-lg shadow-cyan-400/30 transition-all active:scale-95"
              >
                <Play className="h-6 w-6 fill-white" />
                RESUME
              </Button>
              <Button
                onClick={onReset}
                className="h-14 w-14 rounded-4xl bg-white hover:bg-slate-50 border-none shadow-lg text-slate-400 hover:text-cyan-500 transition-all hover:rotate-180 duration-500 flex items-center justify-center p-0"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
              <Button
                onClick={onPause}
                className="h-14 w-14 rounded-4xl bg-white hover:bg-slate-50 border-none shadow-lg text-slate-400 hover:text-cyan-500 transition-all flex items-center justify-center p-0"
              >
                <Pause className="h-6 w-6 fill-current" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: How to Play */}
        <div className="lg:col-span-3">
          <Card className="bg-white border-none rounded-4xl shadow-xl shadow-teal-900/10 overflow-hidden h-full">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-8 text-[#5DA39F]">
                <HelpCircle className="h-6 w-6" />
                <h3 className="font-black text-2xl text-slate-800">How to Play</h3>
              </div>
              <ul className="space-y-6">
                {rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center font-black text-sm border border-cyan-100">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-600 leading-relaxed pt-1">
                      {rule}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/20 flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold text-brand-teal/50 uppercase tracking-widest">
        <div>© 2024 SKILL-LEARN LMS. Premium Gaming Experience.</div>
        <div className="flex gap-6">
          <button className="hover:text-brand-teal">Need Help?</button>
          <button className="hover:text-brand-teal">Report a Bug</button>
        </div>
      </footer>
    </div>
  );
};

export default GamePlayLayout;
